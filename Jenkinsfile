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

        stage('Build Docker Images') {
            steps {
                echo 'Building Docker Images'

                sh 'docker compose build'
            }
        }

        stage('Deploy Containers') {
            steps {
                echo 'Starting Containers'

                sh 'docker compose up -d'
            }
        }

    }
}
