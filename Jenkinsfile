pipeline {
    agent {
        docker {
            image 'node:latest'
            args '-p 3011:3000'
        }
    }
    environment {
        CI = 'true' 
    }
    stages {
        stage('Install') {
            steps {
                sh 'yarn install --network-concurrency 1'
            }
        }
        stage('Test') { 
            steps {
                sh 'yarn test'
            }
        }
        stage('Build') { 
            steps {
                sh 'yarn build'
            }
        }
    }
}
