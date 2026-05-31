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
                sh 'docker rm -f smart-health-pipeline-frontend-1 || true'
                sh 'docker rm -f smart-health-pipeline-backend-1 || true'
                sh 'docker rm -f smart-health-pipeline-mongodb-1 || true'
            }
        }

        stage('Remove Old Images') {
            steps {
                sh 'docker rmi smart-health-devops-frontend || true'
                sh 'docker rmi smart-health-devops-backend || true'
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
        stage('Deploy MongoDB') {
            steps {
                sh '''
                docker start smart-health-pipeline-mongodb-1 || \
                docker run -d --name smart-health-pipeline-mongodb-1 mongo
                   '''
            }
        } 
                            
                    
                                     

        stage('Deploy Backend') {
            steps {
                sh '''
                docker rm -f smart-health-pipeline-backend-1 || true

                docker run -d \
                --name smart-health-pipeline-backend-1 \
                --link smart-health-pipeline-mongodb-1:mongodb \
                -e MONGO_URL=mongodb://mongodb:27017/smarthealth \
                -e JWT_SECRET=smarthealthsecret \
                -e PORT=4000 \
                -p 4000:4000 \
                smart-health-devops-backend
                '''
             }
        }

       stage('Deploy Frontend') {
    steps {
        sh '''
        docker rm -f smart-health-pipeline-frontend-1 || true

        docker run -d \
        --name smart-health-pipeline-frontend-1 \
        -p 5173:5173 \
        smart-health-devops-frontend
        '''
    }
}
       stage('Seed Database') {
           steps {
               sh 'sleep 20'
               sh 'docker exec smart-health-pipeline-backend-1 node src/seed/seed.js || true'
            }
       }
        stage('Build Success') {
            steps {
                echo 'Jenkins CI/CD Deployment Completed Successfully'
            }
        }
    }
}
