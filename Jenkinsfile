pipeline {
    agent any
    tools {
        jdk 'jdk17'
        nodejs 'node18'
    }

    environment {
        SCANNER_HOME = tool 'sonar-scanner'
        APP_NAME = "pass-sk-complaintmanager" // Lowercase the APP_NAME
        RELEASE = "1.0.0"
        DOCKER_USER = "juhal048"
        DOCKER_PASS = 'dockerhub'
        IMAGE_NAME = "${DOCKER_USER}/${APP_NAME}"
        IMAGE_TAG = "${RELEASE}-${BUILD_NUMBER}"
        PATH = "${env.PATH}:${SCANNER_HOME}/bin"
        VENV_DIR = 'venv'
        REQUIREMENTS_FILE = 'requirements.txt'
        FRONTEND_DIR = 'complaints-frontend'
        BACKEND_DIR = 'setup'
	JENKINS_API_TOKEN = credentials("JENKINS_API_TOKEN")
    }

    stages {
        stage('Clean Workspace') {
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

        stage("SonarQube Analysis") {
            steps {
                withSonarQubeEnv('SonarQube-Server') {
                    sh "${SCANNER_HOME}/bin/sonar-scanner -Dsonar.projectName=${APP_NAME} -Dsonar.projectKey=${APP_NAME}"
                }
            }
        }

        stage("Quality Gate") {
            steps {
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'SonarQube-Token'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                sudo apt-get update
                sudo apt-get install -y python3.12-venv curl
                sudo apt-get install -y nodejs
                '''
            }
        }

        stage('TRIVY FS Scan') {
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

        stage("Build & Push Docker Image") {
            steps {
                script {
                    docker.withRegistry('', DOCKER_PASS) {
                        docker_image = docker.build("${IMAGE_NAME}")
                    }
                    docker.withRegistry('', DOCKER_PASS) {
                        docker_image.push("${IMAGE_TAG}")
                        docker_image.push('latest')
                    }
                }
            }
        }
        
        stage("Trivy Image Scan") {
             steps {
                 script {
	              sh ('docker run -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image ashfaque9x/reddit-clone-pipeline:latest --no-progress --scanners vuln  --exit-code 0 --severity HIGH,CRITICAL --format table > trivyimage.txt')
                 }
             }
         }
	    
	 stage ('Cleanup Artifacts') {
             steps {
                 script {
                      sh "docker rmi ${IMAGE_NAME}:${IMAGE_TAG}"
                      sh "docker rmi ${IMAGE_NAME}:latest"
                 }
             }
         }
    }

    post {
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
