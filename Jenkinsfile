pipeline {
    agent {
        docker {
            image 'node:latest'
            args '-p 3000:3000 -v $HOME/.cache/yarn:~/.cache/yarn'
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
    post {
        always {
                script {
                    properties([[$class: 'GithubProjectProperty',
                    projectUrlStr: 'https://github.com/clarity-h2020/map-component']])
                }
                step([$class: 'GitHubIssueNotifier',
                    issueAppend: true,
                    issueReopen: false,
                    issueLabel: 'CI',
                    issueTitle: '$JOB_NAME $BUILD_DISPLAY_NAME failed'])
        }
        failure {
            emailext attachLog: true, 
				to: "pascal@cismet.de", 
				subject: "Build failed in Jenkins: ${currentBuild.fullDisplayName}",
                body: """<p>FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
                <p>Check console output at &QUOT;<a href='${env.BUILD_URL}'>${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>&QUOT;</p>"""
        }
        unstable {
            emailext attachLog: true, 
				to: "pascal@cismet.de", 
				subject: "Jenkins build became unstable: ${currentBuild.fullDisplayName}",
                body: """<p>UNSTABLE: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':</p>
                <p>Check console output at &QUOT;<a href='${env.BUILD_URL}'>${env.JOB_NAME} [${env.BUILD_NUMBER}]</a>&QUOT;</p>"""
        }
    }
}