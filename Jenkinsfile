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
                sh 'docker build -t smart-health-devops-backend ./server'
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t smart-health-devops-frontend ./web'
            }
        }

        stage('Deploy Backend') {
            steps {
                sh '''
                docker stop smart-health-backend || true
                docker rm smart-health-backend || true

                docker run -d \
                  --name smart-health-backend \
                  -p 4000:4000 \
                  smart-health-devops-backend
                '''
            }
        }

        stage('Deploy Frontend') {
            steps {
                sh '''
                docker stop smart-health-frontend || true
                docker rm smart-health-frontend || true

                docker run -d \
                  --name smart-health-frontend \
                  -p 5173:5173 \
                  smart-health-devops-frontend
                '''
            }
        }

        stage('Clean Docker Images') {
            steps {
                sh 'docker image prune -f'
            }
        }
    }
}
