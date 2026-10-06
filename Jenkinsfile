pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
    }

    environment {
        IMAGE_NAME = "sample-ci-app"
        AWS_REGION = "ap-southeast-2"
        ECR_REPOSITORY = "sample-ci-app"
        GIT_BRANCH_NAME = "main"
        GIT_MANIFEST = "k8s/deployment.yaml"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Commit') {
            steps {
                script {
                    env.LAST_COMMIT_AUTHOR = sh(
                        script: 'git log -1 --pretty=%an',
                        returnStdout: true
                    ).trim()

                    echo "Last commit author: ${env.LAST_COMMIT_AUTHOR}"

                    if (env.LAST_COMMIT_AUTHOR == 'Jenkins CI') {
                        env.SKIP_CI = 'true'
                        echo 'Commit was created by Jenkins CI. Skipping CI stages.'
                    } else {
                        env.SKIP_CI = 'false'
                    }
                }
            }
        }

        stage('Install dependencies') {
            when {
                expression {
                    env.SKIP_CI != 'true'
                }
            }

            steps {
                sh '''
                    docker run --rm \
                      -v /home/dk/jenkins-ci-lab/jenkins_home/workspace/$JOB_NAME:/app \
                      -w /app \
                      node:20-alpine npm install
                '''
            }
        }

        stage('Test') {
            when {
                expression {
                    env.SKIP_CI != 'true'
                }
            }

            steps {
                sh '''
                    docker run --rm \
                      -v /home/dk/jenkins-ci-lab/jenkins_home/workspace/$JOB_NAME:/app \
                      -w /app \
                      node:20-alpine npm test
                '''
            }
        }

        stage('Build Docker image') {
            when {
                expression {
                    env.SKIP_CI != 'true'
                }
            }

            steps {
                sh '''
                    docker build \
                      -t $IMAGE_NAME:$BUILD_NUMBER .
                '''
            }
        }

        stage('Push Amazon ECR') {
    when { expression { env.SKIP_CI != 'true' } }
    steps {
        withCredentials([
            string(
                credentialsId: 'aws-access-key-id',
                variable: 'AWS_ACCESS_KEY_ID'
            ),
            string(
                credentialsId: 'aws-secret-access-key',
                variable: 'AWS_SECRET_ACCESS_KEY'
            )
        ]) {
            sh '''
                set -e

                ECR_REGISTRY=$(aws ecr describe-repositories \
                  --repository-names "$ECR_REPOSITORY" \
                  --region "$AWS_REGION" \
                  --query 'repositories[0].repositoryUri' \
                  --output text | cut -d/ -f1)

                ECR_URI="$ECR_REGISTRY/$ECR_REPOSITORY"

                aws ecr get-login-password \
                  --region "$AWS_REGION" \
                | docker login \
                  --username AWS \
                  --password-stdin "$ECR_REGISTRY"

                docker tag \
                  "$IMAGE_NAME:$BUILD_NUMBER" \
                  "$ECR_URI:$BUILD_NUMBER"

                docker push \
                  "$ECR_URI:$BUILD_NUMBER"

                docker logout "$ECR_REGISTRY"
            '''
        }
    }
}


        stage('Update GitOps Manifest') {
    when {
        expression {
            env.SKIP_CI != 'true'
        }
    }

    steps {
        withCredentials([
            usernamePassword(
                credentialsId: 'github-hybrid-cicd-credentials',
                usernameVariable: 'GIT_USER',
                passwordVariable: 'GIT_TOKEN'
            ),
            string(
                credentialsId: 'aws-access-key-id',
                variable: 'AWS_ACCESS_KEY_ID'
            ),
            string(
                credentialsId: 'aws-secret-access-key',
                variable: 'AWS_SECRET_ACCESS_KEY'
            )
        ]) {
            sh '''
                set -e

                ECR_URI=$(aws ecr describe-repositories \
                  --repository-names "$ECR_REPOSITORY" \
                  --region "$AWS_REGION" \
                  --query 'repositories[0].repositoryUri' \
                  --output text)

                sed -i \
                  "s|^[[:space:]]*image: .*|          image: $ECR_URI:$BUILD_NUMBER|" \
                  "$GIT_MANIFEST"

                echo "Updated manifest:"
                grep "image:" "$GIT_MANIFEST"

                git config user.name "Jenkins CI"
                git config user.email "jenkins@lab.local"

                git add "$GIT_MANIFEST"

                if git diff --cached --quiet; then
                    echo "No manifest change detected."
                else
                    git commit \
                      -m "Update sample-ci-app to build $BUILD_NUMBER [skip ci]"

                    git push \
                      "https://${GIT_USER}:${GIT_TOKEN}@github.com/hungdoan42304/hybrid-cicd-mock-project.git" \
                      HEAD:$GIT_BRANCH_NAME
                fi
            '''
        }
    }
}

    }


    post {
        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed. Review the console output.'
        }

        always {
            cleanWs()
        }
    }
}
