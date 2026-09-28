pipeline {
    agent any

    tools {
        nodejs 'Node_24' // Configurado en Global Tools
    }

    stages {

        // Etapa 1: Checkout
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Juanma1208/ucp-app-react'
            }
        }

        // Etapa 2: Build
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }

        // Etapa 3: Pruebas Paralelizadas
        stage('Pruebas en Paralelo') {
            parallel {

                // Pruebas en Chrome
                stage('Pruebas Chrome') {
                    steps {
                        script {
                            try {
                                sh 'npm test -- --browser=chrome --watchAll=false --ci --reporters=jest-junit'
                                junit 'junit-chrome.xml'
                            } catch (err) {
                                echo "Pruebas en Chrome fallaron: ${err}"
                                currentBuild.result = 'UNSTABLE'
                            }
                        }
                    }
                }

                // Pruebas en Firefox
                stage('Pruebas Firefox') {
                    steps {
                        script {
                            try {
                                sh 'npm test -- --browser=firefox --watchAll=false --ci --reporters=jest-junit'
                                junit 'junit-firefox.xml'
                            } catch (err) {
                                echo "Pruebas en Firefox fallaron: ${err}"
                                currentBuild.result = 'UNSTABLE'
                            }
                        }
                    }
                }
            }
        }

        // Etapa 4: Deploy Simulado
        stage('Deploy a Producción (Simulado)') {
            steps {
                script {
                    // Crear carpeta "prod" y copiar build
                    sh 'mkdir -p prod && cp -r build/* prod/'

                    echo "¡Deploy simulado exitoso! Archivos copiados a /prod"
                }
            }
        }
    }

    post {
        always {

            // Publicar reportes HTML (opcional)
            publishHTML target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'prod',
                reportFiles: 'index.html',
                reportName: 'Demo Deploy'
            ]

            // Notificación por email ante fallos
            emailext(
                subject: "Pipeline ${currentBuild.result}: ${env.JOB_NAME}",
                body: """
                    <h2>Resultado: ${currentBuild.result}</h2>
                    <p><b>URL del Build:</b> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                    <p><b>Consola:</b> <a href="${env.BUILD_URL}console">Ver logs</a></p>
                """,
                to: 'juanmavaga12@gmail.com',
                mimeType: 'text/html'
            )

            // Limpiar workspace
            cleanWs()
        }
    }
}