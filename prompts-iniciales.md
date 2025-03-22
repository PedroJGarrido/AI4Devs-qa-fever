## Prompt 1
Como experto en QA y especialista en implentación de pruebas e2e, tienes que probar la pantalla @Positions.tsx.
Puedes revisar el archivo @README.md para entender mejor la estructura del proyecto.
Instala lo que necesites para ejecutar pruebas e2e test usando cypress.
Para escribir estas pruebas, vas a crear un archivo position.spec.js en la ruta "./frontend/cypress/integration" (si no es existen las carpetas las creas).
De momento no escribas ninguna prueba, ahora después de pasaré los casos de prueba a implementar.

## Prompt 2
Muy bien, vamos a proceder a escribir las pruebas e2e en el archivo @position.spec.js .
Estras pruebas van a revisar el escenario "Carga de la Página de Position", para ello van a verificar lo siguiente:
- Verifica que el título de la posición se muestra correctamente.
- Verifica que se muestran las columnas correspondientes a cada fase del proceso de contratación.
- Verifica que las tarjetas de los candidatos se muestran en la columna correcta según su fase actual.

Si existen peticiones al backend, interceptalas y devulve datos mocks que vas a crear en la carpeta fixture.


## Prompt 3
Crea un archivo nuevo de pruebas llamado positionDetails, que contenta las pruebas para el escenario: "Carga de la Página de Position" y que haga las siguientes verificaciones:
- Verifica que el título de la posición se muestra correctamente.
- Verifica que se muestran las columnas correspondientes a cada fase del proceso de contratación.
- Verifica que las tarjetas de los candidatos se muestran en la columna correcta según su fase actual.

mockea toda las llamadas al backend como has hecho antes.