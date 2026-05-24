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

        stage('Build Success') {
            steps {
                echo 'Jenkins CI Build Completed Successfully'
            }
        }
    }
}
