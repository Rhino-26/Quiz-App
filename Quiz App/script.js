const DEFAULT_QUIZ_DATA = {
    physics: {
        title: "Quantum Mechanics: The Basics",
        category: "Theoretical Physics",
        questions: [
            {
                question: "Which principle states that it is impossible to simultaneously know both the exact position and momentum of a particle?",
                options: ["Heisenberg Uncertainty", "Pauli Exclusion Principle", "Schrödinger Equation", "Einstein's Relativity"],
                correct: 0,
                tip: "Consider the relationship between wave-particle duality and the inherent limitations of measurement at subatomic scales."
            },
            {
                question: "What is the primary particle responsible for carrying the electromagnetic force?",
                options: ["Gluon", "W Boson", "Photon", "Graviton"],
                correct: 2,
                tip: "This particle is a quantum of light and all other forms of electromagnetic radiation."
            },
            {
                question: "In the context of wave-particle duality, what equation relates a particle's momentum to its wavelength?",
                options: ["Einstein's Equation", "De Broglie Relation", "Planck's Law", "Maxwell's Equations"],
                correct: 1,
                tip: "Louis de Broglie proposed that any moving particle or object has an associated wave."
            }
        ]
    },
    mathematics: {
        title: "Advanced Calculus & Topology",
        category: "Pure Mathematics",
        questions: [
            {
                question: "Which of these is a topological property that is preserved under homeomorphism?",
                options: ["Volume", "Compactness", "Curvature", "Boundedness"],
                correct: 1,
                tip: "Homeomorphisms are 'rubber-sheet' deformations. Volume and curvature can change, but connectedness and compactness remain."
            },
            {
                question: "What is the result of the integral of 1/x dx?",
                options: ["x^2 / 2", "e^x", "ln|x| + C", "1"],
                correct: 2,
                tip: "Remember that the derivative of the natural logarithm is the reciprocal function."
            }
        ]
    },
    biology: {
        title: "Molecular Genetics",
        category: "Biological Sciences",
        questions: [
            {
                question: "Which enzyme is responsible for unwinding the DNA double helix during replication?",
                options: ["DNA Polymerase", "Ligase", "Helicase", "Primase"],
                correct: 2,
                tip: "Think of it as the 'zipper' that opens up the DNA strands."
            },
            {
                question: "What are the building blocks of proteins?",
                options: ["Nucleotides", "Amino Acids", "Fatty Acids", "Monosaccharides"],
                correct: 1,
                tip: "There are 20 standard ones that combine in various sequences to form complex proteins."
            }
        ]
    }
};

// Application State
let currentState = {
    quiz: null,
    categoryKey: '',
    currentQuestionIndex: 0,
    score: 0,
    userAnswers: [],
    timer: null,
    timeLeft: 15,
    totalTime: 0,
    startTime: null,
    selectedAnswer: null
};

// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    quiz: document.getElementById('quiz-screen'),
    results: document.getElementById('results-screen'),
    quizzes: document.getElementById('my-quizzes-screen'),
    leaderboard: document.getElementById('leaderboard-screen'),
    create: document.getElementById('create-quiz-screen')
};

const elements = {
    categoryList: document.getElementById('category-list'),
    quizCategory: document.getElementById('quiz-category'),
    quizTitle: document.getElementById('quiz-title'),
    timer: document.getElementById('timer'),
    progressBar: document.getElementById('progress-bar'),
    questionIndex: document.getElementById('question-index'),
    percentComplete: document.getElementById('percent-complete'),
    questionTag: document.getElementById('question-tag'),
    questionText: document.getElementById('question-text'),
    optionsList: document.getElementById('options-list'),
    tipText: document.getElementById('tip-text'),
    submitBtn: document.getElementById('submit-btn'),
    skipBtn: document.getElementById('skip-btn'),
    finalScore: document.getElementById('final-score'),
    totalTime: document.getElementById('total-time'),
    resultsChart: document.getElementById('results-chart'),
    restartBtn: document.getElementById('restart-btn'),
    historyList: document.getElementById('history-list'),
    leaderboardBody: document.getElementById('leaderboard-body'),
    
    // Create Mode Elements
    studyMaterial: document.getElementById('study-material'),
    processBtn: document.getElementById('process-material-btn'),
    processingStatus: document.getElementById('processing-status'),
    newQuizTitle: document.getElementById('new-quiz-title'),
    newQuizCategory: document.getElementById('new-quiz-category'),
    questionsBuilder: document.getElementById('questions-builder'),
    addQuestionBtn: document.getElementById('add-question-btn'),
    saveQuizBtn: document.getElementById('save-quiz-btn')
};

// Initialize
function init() {
    renderCategories();
    setupEventListeners();
    renderLeaderboard();
    addQuestionBuilderItem(); // Start with one empty question
}

function renderCategories() {
    elements.categoryList.innerHTML = '';
    
    // Merge default and user quizzes
    const userQuizzes = JSON.parse(localStorage.getItem('userQuizzes') || '{}');
    const allQuizzes = { ...DEFAULT_QUIZ_DATA, ...userQuizzes };

    Object.keys(allQuizzes).forEach(key => {
        const quiz = allQuizzes[key];
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <span class="tag">${quiz.category}</span>
            <h2 style="margin: 1rem 0;">${quiz.title}</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem;">${quiz.questions.length} Questions • 15s per question</p>
        `;
        card.onclick = () => startQuiz(allQuizzes, key);
        elements.categoryList.appendChild(card);
    });
}

function setupEventListeners() {
    elements.submitBtn.onclick = submitAnswer;
    elements.skipBtn.onclick = nextQuestion;
    elements.restartBtn.onclick = () => showScreen('start');

    // Logo Click
    document.getElementById('logo-link').onclick = (e) => {
        e.preventDefault();
        showScreen('start');
        updateActiveNavLink('nav-discover');
    };

    // Navigation Logic
    document.getElementById('nav-discover').onclick = (e) => {
        e.preventDefault();
        showScreen('start');
        updateActiveNavLink('nav-discover');
    };

    document.getElementById('nav-quizzes').onclick = (e) => {
        e.preventDefault();
        loadHistory();
        showScreen('quizzes');
        updateActiveNavLink('nav-quizzes');
    };

    document.getElementById('nav-leaderboard').onclick = (e) => {
        e.preventDefault();
        showScreen('leaderboard');
        updateActiveNavLink('nav-leaderboard');
    };

    document.getElementById('nav-create').onclick = (e) => {
        e.preventDefault();
        showScreen('create');
        updateActiveNavLink('nav-create');
    };

    // Create Screen Logic
    elements.addQuestionBtn.onclick = () => addQuestionBuilderItem();
    elements.saveQuizBtn.onclick = saveCreatedQuiz;
    elements.processBtn.onclick = processStudyMaterial;
}

function updateActiveNavLink(id) {
    document.querySelectorAll('header nav a').forEach(a => a.classList.remove('active'));
    // Handle case where id might not exist (e.g. logo click)
    const link = document.getElementById(id);
    if (link) link.classList.add('active');
}

function showScreen(screenId) {
    if (screenId !== 'quiz') {
        clearInterval(currentState.timer);
    }
    
    Object.keys(screens).forEach(key => {
        screens[key].classList.remove('active');
    });
    screens[screenId].classList.add('active');

    if (screenId === 'start') {
        renderCategories();
    }
}

function startQuiz(dataContext, key) {
    const quiz = dataContext[key];
    currentState = {
        quiz: quiz,
        categoryKey: key,
        currentQuestionIndex: 0,
        score: 0,
        userAnswers: [],
        timeLeft: 15,
        totalTime: 0,
        startTime: Date.now(),
        selectedAnswer: null
    };

    elements.quizCategory.textContent = `CATEGORY: ${quiz.category.toUpperCase()}`;
    elements.quizTitle.textContent = quiz.title;
    elements.questionTag.textContent = quiz.category;

    showScreen('quiz');
    loadQuestion();
}

function loadQuestion() {
    const question = currentState.quiz.questions[currentState.currentQuestionIndex];
    if (!question) return;

    const totalQuestions = currentState.quiz.questions.length;

    elements.questionText.textContent = question.question;
    elements.tipText.textContent = question.tip || "Think carefully before choosing!";
    elements.optionsList.innerHTML = '';
    currentState.selectedAnswer = null;
    
    const progress = (currentState.currentQuestionIndex / totalQuestions) * 100;
    elements.progressBar.style.width = `${progress}%`;
    elements.questionIndex.textContent = `Question ${currentState.currentQuestionIndex + 1} of ${totalQuestions}`;
    elements.percentComplete.textContent = `${Math.round(progress)}% Complete`;

    question.options.forEach((opt, index) => {
        const letter = String.fromCharCode(65 + index);
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.innerHTML = `
            <div class="option-letter">${letter}</div>
            <div class="option-text">${opt}</div>
            <div class="check-icon icon-check"></div>
        `;
        optionDiv.onclick = () => selectOption(optionDiv, index);
        elements.optionsList.appendChild(optionDiv);
    });

    resetTimer();
}

function selectOption(el, index) {
    const active = elements.optionsList.querySelector('.option.selected');
    if (active) active.classList.remove('selected');
    el.classList.add('selected');
    currentState.selectedAnswer = index;
}

function resetTimer() {
    clearInterval(currentState.timer);
    currentState.timeLeft = 15;
    updateTimerDisplay();
    
    currentState.timer = setInterval(() => {
        currentState.timeLeft--;
        updateTimerDisplay();
        
        if (currentState.timeLeft <= 0) {
            clearInterval(currentState.timer);
            nextQuestion();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(currentState.timeLeft / 60);
    const secs = currentState.timeLeft % 60;
    elements.timer.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    if (currentState.timeLeft <= 5) {
        elements.timer.style.color = '#e11d48';
    } else {
        elements.timer.style.color = 'inherit';
    }
}

function submitAnswer() {
    if (currentState.selectedAnswer === null) {
        alert('Please select an answer!');
        return;
    }

    const question = currentState.quiz.questions[currentState.currentQuestionIndex];
    if (currentState.selectedAnswer === question.correct) {
        currentState.score++;
    }
    
    nextQuestion();
}

function nextQuestion() {
    currentState.currentQuestionIndex++;
    
    if (currentState.currentQuestionIndex < currentState.quiz.questions.length) {
        loadQuestion();
    } else {
        saveToHistory();
        showResults();
    }
}

function saveToHistory() {
    const totalTimeMs = Date.now() - currentState.startTime;
    const minutes = Math.floor(totalTimeMs / 60000);
    const seconds = Math.floor((totalTimeMs % 60000) / 1000);
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const historyItem = {
        title: currentState.quiz.title,
        category: currentState.quiz.category,
        score: `${currentState.score}/${currentState.quiz.questions.length}`,
        percentage: Math.round((currentState.score / currentState.quiz.questions.length) * 100),
        time: timeStr,
        date: new Date().toLocaleDateString()
    };

    let history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    history.unshift(historyItem);
    localStorage.setItem('quizHistory', JSON.stringify(history.slice(0, 10)));
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    elements.historyList.innerHTML = '';

    if (history.length === 0) {
        elements.historyList.innerHTML = '<div class="empty-state">No quizzes completed yet. Start your first challenge!</div>';
        return;
    }

    history.forEach(item => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <span class="tag">${item.category}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${item.date}</span>
            </div>
            <h2 style="margin: 1rem 0;">${item.title}</h2>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-weight: 700; color: var(--primary-blue); font-size: 1.2rem;">${item.score}</div>
                <div style="color: var(--text-muted); font-size: 0.9rem;">Time: ${item.time}</div>
            </div>
            <div class="progress-track" style="margin-top: 1rem; height: 4px;">
                <div class="progress-bar" style="width: ${item.percentage}%"></div>
            </div>
        `;
        elements.historyList.appendChild(card);
    });
}

function renderLeaderboard() {
    const mockData = [
        { rank: 1, name: "Alex Rivers", subject: "Theoretical Physics", score: "10/10", time: "02:45", avatar: "AR" },
        { rank: 2, name: "Sarah Chen", subject: "Pure Mathematics", score: "10/10", time: "03:12", avatar: "SC" },
        { rank: 3, name: "Jordan Smith", subject: "Biological Sciences", score: "9/10", time: "02:20", avatar: "JS" },
        { rank: 4, name: "Elena K.", subject: "Theoretical Physics", score: "9/10", time: "03:45", avatar: "EK" },
        { rank: 5, name: "Marcus T.", subject: "Pure Mathematics", score: "8/10", time: "02:55", avatar: "MT" }
    ];

    elements.leaderboardBody.innerHTML = '';
    mockData.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><div class="rank-badge">${user.rank}</div></td>
            <td>
                <div class="user-cell">
                    <img src="https://ui-avatars.com/api/?name=${user.name}&background=random" class="user-avatar" alt="${user.name}">
                    <span>${user.name}</span>
                </div>
            </td>
            <td>${user.subject}</td>
            <td class="score-cell">${user.score}</td>
            <td>${user.time}</td>
        `;
        elements.leaderboardBody.appendChild(tr);
    });
}

// QUIZ BUILDER LOGIC
function addQuestionBuilderItem(data = null) {
    const id = Date.now();
    const item = document.createElement('div');
    item.className = 'question-builder-item';
    item.id = `q-${id}`;
    item.innerHTML = `
        <button class="remove-q-btn" onclick="document.getElementById('q-${id}').remove()">Remove</button>
        <div class="input-group">
            <label>Question</label>
            <input type="text" class="q-text" placeholder="Enter your question here..." value="${data ? data.question : ''}">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div class="input-group">
                <label>Option A</label>
                <input type="text" class="q-opt" placeholder="Option A" value="${data ? data.options[0] : ''}">
            </div>
            <div class="input-group">
                <label>Option B</label>
                <input type="text" class="q-opt" placeholder="Option B" value="${data ? data.options[1] : ''}">
            </div>
            <div class="input-group">
                <label>Option C</label>
                <input type="text" class="q-opt" placeholder="Option C" value="${data ? data.options[2] : ''}">
            </div>
            <div class="input-group">
                <label>Option D</label>
                <input type="text" class="q-opt" placeholder="Option D" value="${data ? data.options[3] : ''}">
            </div>
        </div>
        <div class="input-group" style="margin-top: 1rem;">
            <label>Correct Answer Index (0-3)</label>
            <input type="number" min="0" max="3" class="q-correct" value="${data ? data.correct : '0'}">
        </div>
    `;
    elements.questionsBuilder.appendChild(item);
}

function processStudyMaterial() {
    const text = elements.studyMaterial.value.trim();
    if (!text) {
        alert('Please paste some text first!');
        return;
    }

    elements.processingStatus.style.display = 'block';
    elements.processBtn.disabled = true;

    // Simulate AI generation delay
    setTimeout(() => {
        elements.processingStatus.style.display = 'none';
        elements.processBtn.disabled = false;

        // Smart Extraction Logic (Simplified)
        // We look for sentences that look like facts or patterns
        const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 20);
        
        if (sentences.length < 2) {
            alert('Material too short to generate quality questions. Please add more detail.');
            return;
        }

        elements.questionsBuilder.innerHTML = '';
        elements.newQuizTitle.value = "Smart Generated Quiz";
        
        // Take up to 5 random sentences and turn them into questions
        sentences.slice(0, 5).forEach(sentence => {
            const words = sentence.trim().split(' ');
            const middle = Math.floor(words.length / 2);
            const hiddenWord = words[middle];
            
            words[middle] = "_______";
            
            addQuestionBuilderItem({
                question: words.join(' ') + "?",
                options: [hiddenWord, "Alternative", "Contextual", "Opposite"],
                correct: 0
            });
        });

        alert('Questions generated based on your material! Please review and fix the options below.');
    }, 2000);
}

function saveCreatedQuiz() {
    const title = elements.newQuizTitle.value.trim();
    const category = elements.newQuizCategory.value;
    const qItems = document.querySelectorAll('.question-builder-item');

    if (!title || qItems.length === 0) {
        alert('Please provide a title and at least one question.');
        return;
    }

    const questions = [];
    qItems.forEach(item => {
        const text = item.querySelector('.q-text').value.trim();
        const opts = Array.from(item.querySelectorAll('.q-opt')).map(i => i.value.trim());
        const correct = parseInt(item.querySelector('.q-correct').value);

        if (text && opts.every(o => o)) {
            questions.push({
                question: text,
                options: opts,
                correct: correct,
                tip: "Custom question from your study material."
            });
        }
    });

    if (questions.length === 0) {
        alert('Please fill out the question details.');
        return;
    }

    const newQuiz = {
        title: title,
        category: category,
        questions: questions
    };

    const userQuizzes = JSON.parse(localStorage.getItem('userQuizzes') || '{}');
    const key = `user_${Date.now()}`;
    userQuizzes[key] = newQuiz;
    localStorage.setItem('userQuizzes', JSON.stringify(userQuizzes));

    alert('Quiz saved successfully!');
    renderCategories();
    showScreen('start');
}

function showResults() {
    clearInterval(currentState.timer);
    const totalTimeMs = Date.now() - currentState.startTime;
    const minutes = Math.floor(totalTimeMs / 60000);
    const seconds = Math.floor((totalTimeMs % 60000) / 1000);
    
    elements.totalTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    elements.finalScore.textContent = `${currentState.score}/${currentState.quiz.questions.length}`;
    
    renderResultsChart();
    showScreen('results');
}

function renderResultsChart() {
    elements.resultsChart.innerHTML = '';
    const total = currentState.quiz.questions.length;
    const performances = [40, 60, 90, 75, (currentState.score / (total || 1)) * 100];
    
    performances.forEach((val, i) => {
        const bar = document.createElement('div');
        bar.className = `bar ${i === performances.length - 1 ? 'accent' : ''}`;
        bar.style.height = '0%';
        elements.resultsChart.appendChild(bar);
        
        setTimeout(() => {
            bar.style.height = `${val}%`;
        }, 100 * i);
    });
}

// Start the app
init();
