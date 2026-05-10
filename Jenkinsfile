pipeline {
    agent any

    stages {

        stage('Clone Repository') {
            steps {
                echo 'Cloning GitHub Repository'

                git branch: 'main',
                url: 'https://github.com/shradha9071/smart-health-devops.git'
            }
        }

        stage('Check Docker') {
            steps {
                sh 'docker --version'
            }
        }

        stage('Build Backend Image') {
            steps {
                sh 'docker build -t smart-health-backend ./server'
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t smart-health-frontend ./web'
            }
        }

    }
}
