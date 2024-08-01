pipeline {
    agent {label "Jenkins-Agent" }

    environment {
        // Nastavenie prostredia
        VENV_DIR = 'venv'
        REQUIREMENTS_FILE = 'requirements.txt'
        FRONTEND_DIR = 'complaints-frontend'
        BACKEND_DIR = 'setup'
    }

    stages {
        stage('Checkout') {
            steps {
                // Klonovanie zdrojového kódu z Git
                git branch: 'main', url: 'https://github.com/csw48/PASS-SK-ComplaintManager'
            }
        }

        stage('Backend - Install Dependencies') {
            steps {
                // Setup Python environment and install dependencies
                sh '''
                python3 -m venv venv
                . venv/bin/activate
                pip3 install -r requirements.txt
                '''
            }
        }

        stage('Backend - Run Tests') {
            steps {
                // Run Django tests
                sh '''
                . venv/bin/activate
                python3 manage.py test
                '''
            }
        }

        stage('Frontend - Install Dependencies') {
            steps {
                // Install Node.js dependencies
                sh '''
                cd complaints-frontend
                npm install
                '''
            }
        }

        stage('Frontend - Run Tests') {
            steps {
                // Run React tests
                sh '''
                cd complaints-frontend
                npm test -- --watchAll=false
                '''
            }
        }

        stage('Frontend - Build') {
            steps {
                // Build the React application
                sh '''
                cd complaints-frontend
                npm run build
                '''
            }
        }

        stage('Backend - Collect Static Files') {
            steps {
                // Collect static files
                sh '''
                . venv/bin/activate
                python3 manage.py collectstatic --noinput
                '''
            }
        }

    post {
        always {
            // Vyčistenie pracovného priestoru po dokončení pipeline
            cleanWs()
        }
        success {
            // Oznámenie o úspešnom dokončení
            echo 'Pipeline completed successfully!'
        }
        failure {
            // Oznámenie o neúspechu
            echo 'Pipeline failed.'
        }
    }
}
