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
      cy.get('h2')
        .should('be.visible')
        .and('contain.text', 'Posiciones');
    });

    it('Debe mostrar los filtros de búsqueda', () => {
      // Verificar que existen los filtros
      cy.get('input[placeholder="Buscar por título"]').should('exist');
      cy.get('input[type="date"]').should('exist');
      cy.get('select').should('have.length', 2); // Dos selectores: Estado y Manager
    });

    it('Debe mostrar las tarjetas de posición con la información correcta', () => {
      // Verificar que se muestran todas las tarjetas
      cy.get('.card').should('have.length', 3);

      // Verificar la primera posición
      cy.get('.card').first().within(() => {
        cy.get('.card-title').should('contain', 'Desarrollador Frontend Senior');
        cy.get('.card-text').should('contain', 'John Doe');
        cy.get('.badge').should('contain', 'Open')
          .and('have.class', 'bg-warning');
      });
    });

    it('Debe mostrar los estados con los colores correctos', () => {
      // Verificar estado Open
      cy.get('.badge').contains('Open')
        .should('have.class', 'bg-warning');

      // Verificar estado Contratado
      cy.get('.badge').contains('Contratado')
        .should('have.class', 'bg-success');

      // Verificar estado Cerrado
      cy.get('.badge').contains('Cerrado')
        .should('have.class', 'bg-warning');
    });

    it('Debe tener botones funcionales en cada tarjeta', () => {
      cy.get('.card').first().within(() => {
        cy.get('button').contains('Ver proceso').should('exist');
        cy.get('button').contains('Editar').should('exist');
      });
    });

    it('Debe navegar correctamente al hacer clic en Ver proceso', () => {
      // Remover el overlay de webpack antes de hacer clic
      cy.get('#webpack-dev-server-client-overlay').then($overlay => {
        if ($overlay.length > 0) {
          $overlay.remove();
        }
      });

      cy.get('.card').first().within(() => {
        cy.get('button').contains('Ver proceso').click({ force: true });
      });
      
      // Esperar a que se completen las llamadas al backend
      cy.wait(['@getInterviewFlow', '@getCandidates']);
      
      // Verificar que la URL cambió al ID correcto
      cy.url().should('include', '/positions/1');
    });
  });
});
