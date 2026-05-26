pipeline {
    agent any

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main',
                credentialsId: 'github-token',
                url: 'https://github.com/shradha9071/smart-health-devops.git'
            }
        }

        stage('Build Backend Image') {
            steps {
                sh 'docker build --no-cache -t smart-health-devops-backend ./server'
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh 'docker build --no-cache -t smart-health-devops-frontend ./web'
            }
        }

        stage('Stop Old Containers') {
            steps {
                sh 'docker rm -f smart-health-frontend || true'
                sh 'docker rm -f smart-health-backend || true'
            }
        }

        stage('Deploy Backend') {
            steps {
                sh 'docker run -d --name smart-health-backend -p 4000:4000 smart-health-devops-backend'
            }
        }

        stage('Deploy Frontend') {
            steps {
                sh 'docker run -d --name smart-health-frontend -p 5173:5173 smart-health-devops-frontend'
            }
        }

        stage('Build Success') {
            steps {
                echo 'Jenkins CI/CD Deployment Completed Successfully'
            }
        }
    }
}
