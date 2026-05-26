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

        stage('Stop Old Containers') {
            steps {
                sh 'docker compose down || true'
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

        stage('Deploy Application') {
            steps {
                sh 'docker compose up -d'
            }
        }

        stage('Build Success') {
            steps {
                echo 'Jenkins CI/CD Deployment Completed Successfully'
            }
        }
    }
}
