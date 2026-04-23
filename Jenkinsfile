pipeline {
    agent any

    environment {
        DOCKERHUB_CREDS = 'dockerhub-creds'
        DOCKER_USER = 'mohityadv'
        NETWORK = "docnest-network"
    }

    stages {

        stage('Clone Repo') {
            steps {
                git branch: 'main', url: 'https://github.com/Mohit-Y-Kumar/DocNest.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                script {

                    def BACKEND_IMAGE = "${DOCKER_USER}/docnest-backend:latest"
                    def FRONTEND_IMAGE = "${DOCKER_USER}/docnest-frontend:latest"
                    def ADMIN_IMAGE = "${DOCKER_USER}/docnest-admin:latest"

                    sh "docker build -t ${BACKEND_IMAGE} ./backend"

                    sh """
                    docker build \
                    --build-arg VITE_BACKEND_URL=http://localhost:4000 \
                    -t ${FRONTEND_IMAGE} ./frontend
                    """

                    sh """
                    docker build \
                    --build-arg VITE_BACKEND_URL=http://localhost:4000 \
                    -t ${ADMIN_IMAGE} ./admin
                    """
                }
            }
        }

        stage('Login to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: DOCKERHUB_CREDS, usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh "echo \$PASS | docker login -u \$USER --password-stdin"
                }
            }
        }

        stage('Push Images') {
            steps {
                script {
                    def BACKEND_IMAGE = "${DOCKER_USER}/docnest-backend:latest"
                    def FRONTEND_IMAGE = "${DOCKER_USER}/docnest-frontend:latest"
                    def ADMIN_IMAGE = "${DOCKER_USER}/docnest-admin:latest"

                    sh "docker push ${BACKEND_IMAGE}"
                    sh "docker push ${FRONTEND_IMAGE}"
                    sh "docker push ${ADMIN_IMAGE}"
                }
            }
        }

        stage('Remove Old Containers') {
            steps {
                script {
                    sh "docker rm -f backend || true"
                    sh "docker rm -f frontend || true"
                    sh "docker rm -f admin || true"
                    sh "docker network rm ${NETWORK} || true"
                }
            }
        }

        stage('Run Containers') {
            steps {
                script {

                    def BACKEND_IMAGE = "${DOCKER_USER}/docnest-backend:latest"
                    def FRONTEND_IMAGE = "${DOCKER_USER}/docnest-frontend:latest"
                    def ADMIN_IMAGE = "${DOCKER_USER}/docnest-admin:latest"

                    sh "docker network create ${NETWORK} || true"

                    sh """
                    docker run -d \
                      --name backend \
                      --network ${NETWORK} \
                      -p 4000:4000 \
                      --env-file /home/vagrant/DocNest/backend/.env \
                      ${BACKEND_IMAGE}
                    """

                    sh """
                    docker run -d \
                      --name frontend \
                      --network ${NETWORK} \
                      -p 3000:80 \
                      ${FRONTEND_IMAGE}
                    """

                    sh """
                    docker run -d \
                      --name admin \
                      --network ${NETWORK} \
                      -p 3001:80 \
                      ${ADMIN_IMAGE}
                    """
                }
            }
        }
    }

    post {
        success {
            echo "DocNest deployed successfully "
        }
        failure {
            echo "Deployment failed "
        }
    }
}