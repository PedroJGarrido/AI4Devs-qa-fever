describe('Página de Detalles de Position', () => {
  beforeEach(() => {
    // Interceptar las llamadas al API
    cy.intercept({
      method: 'GET',
      url: '**/positions/1/interviewFlow'
    }, {
      fixture: 'interviewFlow.json'
    }).as('getInterviewFlow');

    cy.intercept({
      method: 'GET',
      url: '**/positions/1/candidates'
    }, {
      fixture: 'positionCandidates.json'
    }).as('getCandidates');

    // Interceptar la llamada a los detalles del candidato
    cy.intercept({
      method: 'GET',
      url: '**/candidates/1'
    }, {
      fixture: 'candidateDetails.json'
    }).as('getCandidateDetails');

    // Visitar la página
    cy.visit('/positions/1');

    // Esperar a que las llamadas se completen
    cy.wait(['@getInterviewFlow', '@getCandidates']);
  });

  describe('Carga de la Página de Position', () => {
    it('Debe mostrar el título de la posición correctamente', () => {
      cy.get('h2')
        .should('be.visible')
        .and('contain', 'Desarrollador Frontend Senior');
    });

    it('Debe mostrar las columnas correspondientes a cada fase del proceso', () => {
      // Verificar que existen todas las columnas del proceso
      cy.get('[data-testid="stage-column"]')
        .should('have.length', 3)
        .then($columns => {
          // Verificar los títulos de las columnas
          cy.wrap($columns[0]).find('.card-header').should('contain', 'CV Review');
          cy.wrap($columns[1]).find('.card-header').should('contain', 'Technical Interview');
          cy.wrap($columns[2]).find('.card-header').should('contain', 'HR Interview');
        });
    });

    it('Debe mostrar las tarjetas de candidatos en las columnas correctas', () => {
      // Verificar candidato en la columna CV Review
      cy.get('[data-testid="stage-column"]').eq(0).within(() => {
        cy.get('[data-testid="candidate-card"]')
          .should('have.length', 1)
          .find('.card-title')
          .should('contain', 'Ana García');
      });

      // Verificar candidato en la columna Technical Interview
      cy.get('[data-testid="stage-column"]').eq(1).within(() => {
        cy.get('[data-testid="candidate-card"]')
          .should('have.length', 1)
          .find('.card-title')
          .should('contain', 'Carlos Rodríguez');
      });

      // Verificar candidato en la columna HR Interview
      cy.get('[data-testid="stage-column"]').eq(2).within(() => {
        cy.get('[data-testid="candidate-card"]')
          .should('have.length', 1)
          .find('.card-title')
          .should('contain', 'María López');
      });
    });

    it('Debe permitir ver los detalles de un candidato', () => {
      // Click en la primera tarjeta de candidato
      cy.get('[data-testid="candidate-card"]').first().click();

      // Esperar a que se carguen los detalles
      cy.wait('@getCandidateDetails');

      // Verificar que se muestra el panel de detalles
      cy.get('[data-testid="candidate-details"]')
        .should('be.visible');

      // Verificar el nombre del candidato
      cy.get('[data-testid="candidate-name"]')
        .should('contain', 'Ana García');
    });
  });
}); 