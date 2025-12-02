pipeline {
    agent any

    triggers {
        pollSCM('H/5 * * * *')
    }

    environment {
        PORT = '4000'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/vathcodes/aeco22food.git'
            }
        }

        stage('Build & Deploy Docker Compose') {
            steps {
                withCredentials([
                    string(credentialsId: 'MONGODB_URI', variable: 'MONGODB_URI'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'VNPAY_TMN_CODE', variable: 'VNPAY_TMN_CODE'),
                    string(credentialsId: 'VNPAY_HASH_SECRET', variable: 'VNPAY_HASH_SECRET')
                ]) {
                    sh '''
                    cat > .env <<EOF
                    PORT=$PORT
                    MONGODB_URI=$MONGODB_URI
                    JWT_SECRET=$JWT_SECRET
                    VNPAY_TMN_CODE=$VNPAY_TMN_CODE
                    VNPAY_HASH_SECRET=$VNPAY_HASH_SECRET
                    BACKEND_URL=http://34.9.54.54:4000
                    FRONTEND_URL=http://34.9.54.54:3000
                    EOF

                    docker-compose down
                    docker-compose up --build -d
                    '''
                }
            }
        }
    }
}
