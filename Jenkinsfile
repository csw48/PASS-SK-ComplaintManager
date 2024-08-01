pipeline {
    agent { label 'Jenkins-Agent' }

    environment {
        VENV_DIR = 'venv'
        REQUIREMENTS_FILE = 'requirements.txt'
        FRONTEND_DIR = 'complaints-frontend'
        BACKEND_DIR = 'setup'
    }

    stages {
        stage('Checkout') {
            steps {
                // Clone source code from Git
                git branch: 'main', url: 'https://github.com/csw48/PASS-SK-ComplaintManager'
            }
        }

        stage('Install System Dependencies') {
            steps {
                // Install system dependencies
                sh '''
                sudo apt-get update
                sudo apt-get install -y python3.12-venv
                '''
            }
        }

        stage('Backend - Install Dependencies') {
            steps {
                // Setup Python environment and install dependencies
                sh '''
                python3 -m venv ${VENV_DIR}
                . ${VENV_DIR}/bin/activate
                pip3 install -r ${REQUIREMENTS_FILE}
                '''
            }
        }

        stage('Backend - Run Tests') {
            steps {
                // Run Django tests
                sh '''
                . ${VENV_DIR}/bin/activate
                cd ${BACKEND_DIR}
                python3 manage.py test
                '''
            }
        }

        stage('Frontend - Install Dependencies') {
            steps {
                // Install Node.js dependencies
                sh '''
                cd ${FRONTEND_DIR}
                npm install
                '''
            }
        }

        stage('Frontend - Run Tests') {
            steps {
                // Run React tests
                sh '''
                cd ${FRONTEND_DIR}
                npm test -- --watchAll=false
                '''
            }
        }

        stage('Frontend - Build') {
            steps {
                // Build the React application
                sh '''
                cd ${FRONTEND_DIR}
                npm run build
                '''
            }
        }

        stage('Backend - Collect Static Files') {
            steps {
                // Collect static files
                sh '''
                . ${VENV_DIR}/bin/activate
                cd ${BACKEND_DIR}
                python3 manage.py collectstatic --noinput
                '''
            }
        }
    }

    post {
        always {
            // Clean up workspace after completion
            cleanWs()
        }
        success {
            // Notification of successful completion
            echo 'Pipeline completed successfully!'
        }
        failure {
            // Notification of failure
            echo 'Pipeline failed.'
        }
    }
}
