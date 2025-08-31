node  {
    def app
    def COLOR_MAP = ['SUCCESS': 'good', 'FAILURE': 'danger', 'UNSTABLE': 'danger', 'ABORTED': 'danger']

    stage('clone repo') {
	     cleanWs();
             checkout scm
        }
    stage('build app') {
	    dir('deploy/docker/compose')
           {
	         sh "docker-compose build"
           }  
        }
	
	stage ("shut down app")
        {       
		dir('deploy/docker/compose/'){
		   sh "docker-compose down"}
	   
               sleep(time:3,unit:"SECONDS")
        }

    stage('start app') {
	    dir('deploy/docker/compose/'){
              sh "docker-compose up -d"
	    }
    }
	 stage('clear ws') {
             cleanWs();
    }
	
}