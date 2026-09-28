pipeline {
    agent any

    tools {
        nodejs 'Node_24' // Configurado en Global Tools
    }

    environment {
        CI = 'true' // Jest corre en modo CI (sin modo interactivo)
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

                // Pruebas "Chrome" (Jest corre en jsdom; el nombre solo identifica la rama)
                stage('Pruebas Chrome') {
                    steps {
                        script {
                            def status = sh(
                                script: 'JEST_JUNIT_OUTPUT_NAME=junit-chrome.xml npm test -- --watchAll=false --ci --reporters=default --reporters=jest-junit',
                                returnStatus: true
                            )
                            junit allowEmptyResults: true, testResults: 'junit-chrome.xml'
                            if (status != 0) {
                                unstable('Pruebas en Chrome fallaron')
                            }
                        }
                    }
                }

                // Pruebas "Firefox"
                stage('Pruebas Firefox') {
                    steps {
                        script {
                            def status = sh(
                                script: 'JEST_JUNIT_OUTPUT_NAME=junit-firefox.xml npm test -- --watchAll=false --ci --reporters=default --reporters=jest-junit',
                                returnStatus: true
                            )
                            junit allowEmptyResults: true, testResults: 'junit-firefox.xml'
                            if (status != 0) {
                                unstable('Pruebas en Firefox fallaron')
                            }
                        }
                    }
                }
            }
        }

        // Etapa 4: Deploy Simulado (solo si las pruebas pasaron)
        stage('Deploy a Producción (Simulado)') {
            when {
                expression { currentBuild.currentResult == 'SUCCESS' }
            }
            steps {
                sh 'mkdir -p prod && cp -r build/* prod/'
                echo '¡Deploy simulado exitoso! Archivos copiados a /prod'
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

            // Notificación por email con el resultado del build
            emailext(
                subject: "Pipeline ${currentBuild.currentResult}: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    <h2>Resultado: ${currentBuild.currentResult}</h2>
                    <p><b>URL del Build:</b> <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
                    <p><b>Pruebas:</b> <a href="${env.BUILD_URL}testReport">Ver resultados</a></p>
                    <p><b>Consola:</b> <a href="${env.BUILD_URL}console">Ver logs</a></p>
                """,
                to: 'juan7.valencia@ucp.edu.co',
                mimeType: 'text/html'
            )

            // Limpiar workspace
            cleanWs()
        }
    }
}