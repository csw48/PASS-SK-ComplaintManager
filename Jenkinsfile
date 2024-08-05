pipeline {
    agent any
    tools {
        jdk 'jdk17'
        nodejs 'node18'
   }

    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        APP_NAME = "PASS-SK-ComplaintManager"
        RELEASE = "1.0.0"
        DOCKER_USER = "juhal048"
        DOCKER_PASS = 'dockerhub'
        IMAGE_NAME = "${DOCKER_USER}" + "/" + "${APP_NAME}"
        IMAGE_TAG = "${RELEASE}-${BUILD_NUMBER}"
        VENV_DIR = 'venv'
        REQUIREMENTS_FILE = 'requirements.txt'
        FRONTEND_DIR = 'complaints-frontend'
        BACKEND_DIR = 'setup'
    }

    stages {
        stage('clean workspace') {
            steps {
                cleanWs()
            }
        }
            
        stage('Checkout') {
            steps {
                // Clone source code from Git
                git branch: 'master', url: 'https://github.com/csw48/PASS-SK-ComplaintManager' 
            }
        }

        stage("Sonarqube Analysis") {
            steps {
                withSonarQubeEnv('SonarQube-Server') {
                    sh '''$SCANER_HOME/bin/sonar-scanner -Dsonar.projectName=PASS-SK-ComplaintManager \
                    -Dsonar.projectKey=PASS-SK-ComplaintManager'''
                }
            }
        }

        stage("QualityGate") {
            steps {
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'SonarQube-Token'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                // Install system dependencies
                sh '''
                sudo apt-get update
                sudo apt-get install -y python3.12-venv curl
                curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
                sudo apt-get install -y nodejs
                '''
            }
        }

        stage('TRIVY FS SCAN') {
            steps {
                sh "trivy fs . > trivyfs.txt"
            }
        }

        stage('Backend - Install Dependencies') {
            steps {
                // Setup Python environment and install dependencies
                sh '''
                python3 -m venv ${WORKSPACE}/${VENV_DIR}
                . ${WORKSPACE}/${VENV_DIR}/bin/activate
                pip3 install -r ${WORKSPACE}/${REQUIREMENTS_FILE}
                '''
            }
        }

        stage('Backend - Run Tests') {
            steps {
                // Run Django tests
                sh '''
                . ${WORKSPACE}/${VENV_DIR}/bin/activate
                cd ${WORKSPACE}/${BACKEND_DIR}
                python3 manage.py test
                '''
            }
        }

        stage('Frontend - Install Dependencies') {
            steps {
                // Install Node.js dependencies
                sh '''
                cd ${WORKSPACE}/${FRONTEND_DIR}
                npm install
                '''
            }
        }
        
        stage('Frontend - Build') {
            steps {
                // Build the React application
                sh '''
                cd ${WORKSPACE}/${FRONTEND_DIR}
                npm run build
                '''
            }
        }

        stage('Backend - Collect Static Files') {
            steps {
                // Collect static files
                sh '''
                . ${WORKSPACE}/${VENV_DIR}/bin/activate
                cd ${WORKSPACE}/${BACKEND_DIR}
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
