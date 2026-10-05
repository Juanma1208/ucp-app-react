pipeline {
    agent any

    tools {
        nodejs 'Node_24'                  // Configurado en Global Tools
    }

    environment {
        CI = 'true' // Jest corre en modo CI

        SONAR_PROJECT_KEY = 'ucp-app-react'
        SONAR_PROJECT_NAME = 'UCP React App'
        SCANNER_HOME = tool 'SonarQubeScanner'  // Configurado en Global Tools
    }

    stages {

        // Etapa 1: Checkout
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Juanma1208/ucp-app-react'
            }
        }

        // Etapa 2: Instalación y Build
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }

        // Etapa 3: Generar cobertura para SonarQube
        stage('Cobertura') {
            steps {
                sh 'npm run test:coverage'
            }
        }

        // Etapa 4: Análisis con SonarQube
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        "${SCANNER_HOME}/bin/sonar-scanner" \
                        -Dsonar.projectKey="${SONAR_PROJECT_KEY}" \
                        -Dsonar.projectName="${SONAR_PROJECT_NAME}" \
                        -Dsonar.sources=src \
                        -Dsonar.tests=src \
                        -Dsonar.test.inclusions="**/*.test.js,**/*.test.jsx" \
                        -Dsonar.javascript.node.maxspace=1024 \
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                    '''
                }
            }
        }

        // Etapa 5: Validar Quality Gate
        stage('Quality Gate') {
            steps {
                script {
                    timeout(time: 5, unit: 'MINUTES') {
                        def qg = waitForQualityGate()

                        if (qg.status != 'OK') {
                            error "Calidad no aprobada por SonarQube: ${qg.status}"
                        }
                    }
                }
            }
        }

        // Etapa 6: Pruebas Paralelizadas
        stage('Pruebas en Paralelo') {
            parallel {

                // Pruebas "Chrome"
                stage('Pruebas Chrome') {
                    steps {
                        script {
                            def status = sh(
                                script: 'JEST_JUNIT_OUTPUT_NAME=junit-chrome.xml npm test -- --watchAll=false --ci --reporters=default --reporters=jest-junit',
                                returnStatus: true
                            )

                            junit allowEmptyResults: true,
                                testResults: 'junit-chrome.xml'

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

                            junit allowEmptyResults: true,
                                testResults: 'junit-firefox.xml'

                            if (status != 0) {
                                unstable('Pruebas en Firefox fallaron')
                            }
                        }
                    }
                }
            }
        }

        stage('Security Scan with Snyk') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'SNYK_API_TOKEN', variable: 'SNYK_TOKEN')]) {
                        sh 'npm install -g snyk'
                        sh 'snyk auth ${SNYK_TOKEN}'
                        try {
                            sh 'snyk test --all-projects --severity-threshold=high'
                        } catch (err) {
                            echo "Snyk encontró vulnerabilidades altas o críticas: ${err}"
                            currentBuild.result = 'UNSTABLE'
                        }
                        sh 'snyk monitor --all-projects'
                    }
                }
            }
        }

        // Etapa 7: Deploy Simulado
        stage('Deploy a Producción (Simulado)') {
            when {
                expression {
                    currentBuild.currentResult == 'SUCCESS'
                }
            }

            steps {
                sh 'mkdir -p prod && cp -r build/* prod/'
                echo '¡Deploy simulado exitoso! Archivos copiados a /prod'
            }
        }
    }

    post {
        always {

            // Publicar reportes HTML
            publishHTML target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'prod',
                reportFiles: 'index.html',
                reportName: 'Demo Deploy'
            ]

            // Notificación por email
            emailext(
                subject: "Pipeline ${currentBuild.currentResult}: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    <h2>Resultado: ${currentBuild.currentResult}</h2>

                    <p>
                        <b>URL del Build:</b>
                        <a href="${env.BUILD_URL}">
                            ${env.BUILD_URL}
                        </a>
                    </p>

                    <p>
                        <b>Pruebas:</b>
                        <a href="${env.BUILD_URL}testReport">
                            Ver resultados
                        </a>
                    </p>

                    <p>
                        <b>Consola:</b>
                        <a href="${env.BUILD_URL}console">
                            Ver logs
                        </a>
                    </p>
                """,
                to: 'juan7.valencia@ucp.edu.co',
                mimeType: 'text/html'
            )

            // Limpiar workspace
            cleanWs()
        }
    }
}