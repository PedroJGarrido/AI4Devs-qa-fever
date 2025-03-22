describe('Página de Positions', () => {
  beforeEach(() => {
    // Interceptar la llamada a la API de posiciones
    cy.intercept('GET', 'http://localhost:3010/positions', {
      fixture: 'positions.json'
    }).as('getPositions');

    // Interceptar la llamada al flujo de entrevistas
    cy.intercept('GET', 'http://localhost:3010/positions/1/interviewFlow', {
      fixture: 'interviewFlow.json'
    }).as('getInterviewFlow');

    // Interceptar la llamada a candidatos
    cy.intercept('GET', 'http://localhost:3010/positions/1/candidates', {
      fixture: 'candidates.json'
    }).as('getCandidates');

    // Visitar la página de positions
    cy.visit('/positions');

    // Esperar a que la llamada a la API se complete
    cy.wait('@getPositions');
  });

  describe('Carga de la Página de Position', () => {
    it('Debe mostrar el título de la página correctamente', () => {
      cy.get('[data-testid="page-title"]')
        .should('be.visible')
        .and('contain.text', 'Posiciones');
    });

    it('Debe mostrar los filtros de búsqueda', () => {
      // Verificar que existen los filtros
      cy.get('[data-testid="title-search"]').should('exist');
      cy.get('[data-testid="date-search"]').should('exist');
      cy.get('[data-testid="status-filter"]').should('exist');
      cy.get('[data-testid="manager-filter"]').should('exist');
    });

    it('Debe mostrar las tarjetas de posición con la información correcta', () => {
      // Verificar que se muestran todas las tarjetas
      cy.get('[data-testid="position-card"]').should('have.length', 3);

      // Verificar la primera posición
      cy.get('[data-testid="position-card"]').first().within(() => {
        cy.get('[data-testid="position-title"]').should('contain', 'Desarrollador Frontend Senior');
        cy.get('[data-testid="position-details"]').should('contain', 'John Doe');
        cy.get('[data-testid="position-status"]')
          .should('contain', 'Open')
          .and('have.class', 'bg-warning');
      });
    });

    it('Debe mostrar los estados con los colores correctos', () => {
      // Verificar estado Open
      cy.get('[data-testid="position-status"]').contains('Open')
        .should('have.class', 'bg-warning');

      // Verificar estado Contratado
      cy.get('[data-testid="position-status"]').contains('Contratado')
        .should('have.class', 'bg-success');

      // Verificar estado Cerrado
      cy.get('[data-testid="position-status"]').contains('Cerrado')
        .should('have.class', 'bg-warning');
    });

    it('Debe tener botones funcionales en cada tarjeta', () => {
      cy.get('[data-testid="position-card"]').first().within(() => {
        cy.get('[data-testid="view-process-button"]').should('exist');
        cy.get('[data-testid="edit-button"]').should('exist');
      });
    });

    it('Debe navegar correctamente al hacer clic en Ver proceso', () => {
      cy.get('[data-testid="position-card"]').first().within(() => {
        cy.get('[data-testid="view-process-button"]').click();
      });
      
      // Esperar a que se completen las llamadas al backend
      cy.wait(['@getInterviewFlow', '@getCandidates']);
      
      // Verificar que la URL cambió al ID correcto
      cy.url().should('include', '/positions/1');
    });
  });
});
