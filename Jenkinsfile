node  {
    def app
    def COLOR_MAP = ['SUCCESS': 'good', 'FAILURE': 'danger', 'UNSTABLE': 'danger', 'ABORTED': 'danger']

    stage('Clone repository') {
        /* Let's make sure we have the repository cloned to our workspace */
            checkout scm
        }

    stage('Build Application') {
            sh "docker-compose build"
    }
      stage('Shut down Application') {
        sh "docker-compose down"
        }
     stage('Start Application') {
            sh "docker-compose up -d"
    }
       stage('Clear ws') {
             cleanWs();
    }
}