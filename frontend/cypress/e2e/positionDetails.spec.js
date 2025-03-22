describe('Página de Detalles de Position', () => {
  // Función auxiliar para simular drag and drop
  const simulateDragDrop = (source, destination) => {
    // Crear el evento que espera react-beautiful-dnd
    const dragEndEvent = {
      source: {
        droppableId: '1', // ID de CV Review
        index: 0
      },
      destination: {
        droppableId: '2', // ID de Technical Interview
        index: 0
      },
      draggableId: '1',
      type: 'DEFAULT',
      mode: 'FLUID'
    };

    // Encontrar el DragDropContext y disparar el evento onDragEnd directamente
    const dragDropContext = document.querySelector('[data-testid="drag-drop-context"]');
    if (!dragDropContext) {
      throw new Error('No se encontró el DragDropContext');
    }

    // Encontrar el manejador onDragEnd
    const reactKey = Object.keys(dragDropContext).find(key => key.startsWith('__reactProps$'));
    if (!reactKey || !dragDropContext[reactKey].onDragEnd) {
      throw new Error('No se encontró el manejador onDragEnd');
    }

    // Llamar al manejador con el evento
    dragDropContext[reactKey].onDragEnd(dragEndEvent);
  };

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

    // Interceptar la actualización del candidato
    cy.intercept({
      method: 'PUT',
      url: '**/candidates/1'
    }, {
      statusCode: 200,
      body: {
        id: 1,
        currentInterviewStep: 2,
        message: 'Candidate updated successfully'
      }
    }).as('updateCandidate');

    // Visitar la página
    cy.visit('/positions/1');

    // Esperar a que las llamadas se completen
    cy.wait(['@getInterviewFlow', '@getCandidates']);
  });

  describe('Carga de la Página de Position', () => {
    it('Debe mostrar el título de la posición correctamente', () => {
      cy.get('[data-testid="position-title"]')
        .should('be.visible')
        .and('contain', 'Desarrollador Frontend Senior');
    });

    it('Debe mostrar las columnas correspondientes a cada fase del proceso', () => {
      // Verificar que existen todas las columnas del proceso
      cy.get('[data-testid="stage-column"]')
        .should('have.length', 3)
        .then($columns => {
          // Verificar los títulos de las columnas
          cy.wrap($columns[0]).find('[data-testid="column-header"]').should('contain', 'CV Review');
          cy.wrap($columns[1]).find('[data-testid="column-header"]').should('contain', 'Technical Interview');
          cy.wrap($columns[2]).find('[data-testid="column-header"]').should('contain', 'HR Interview');
        });
    });

    it('Debe mostrar las tarjetas de candidatos en las columnas correctas', () => {
      // Verificar candidato en la columna CV Review
      cy.get('[data-testid="stage-column"]').eq(0).within(() => {
        cy.get('[data-testid="candidate-card"]')
          .should('have.length', 1)
          .find('[data-testid="candidate-name"]')
          .should('contain', 'Ana García');
      });

      // Verificar candidato en la columna Technical Interview
      cy.get('[data-testid="stage-column"]').eq(1).within(() => {
        cy.get('[data-testid="candidate-card"]')
          .should('have.length', 1)
          .find('[data-testid="candidate-name"]')
          .should('contain', 'Carlos Rodríguez');
      });

      // Verificar candidato en la columna HR Interview
      cy.get('[data-testid="stage-column"]').eq(2).within(() => {
        cy.get('[data-testid="candidate-card"]')
          .should('have.length', 1)
          .find('[data-testid="candidate-name"]')
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

  describe('Cambio de Fase de un Candidato', () => {
    it('Debe permitir arrastrar un candidato a otra columna', () => {
      // Verificar que la tarjeta origen existe y está en la posición correcta
      cy.get('[data-testid="stage-column"]')
        .eq(0)
        .find('[data-testid="candidate-card"]')
        .first()
        .as('sourceCard');

      cy.get('@sourceCard')
        .should('be.visible')
        .find('[data-testid="candidate-name"]')
        .should('contain', 'Ana García');

      // Interceptar la llamada PUT antes de hacer el cambio
      cy.intercept('PUT', '**/candidates/1', {
        statusCode: 200,
        body: {
          id: 1,
          applicationId: 101,
          currentInterviewStep: 2,
          message: 'Candidate updated successfully'
        }
      }).as('updateCandidate');

      // Asegurarnos de que ambas columnas están presentes
      cy.get('[data-testid="stage-column"]')
        .should('have.length', 3)
        .as('columns');

      // Simular mousedown en el origen
      cy.get('@sourceCard').trigger('mousedown', {
        button: 0,
        force: true
      });

      // Simular mousemove inicial
      cy.get('@sourceCard').trigger('mousemove', {
        button: 0,
        clientX: 100,
        clientY: 100,
        force: true
      });

      // Simular mousemove al destino
      cy.get('[data-testid="stage-column"]')
        .eq(1)
        .as('targetColumn')
        .trigger('mousemove', {
          button: 0,
          clientX: 300,
          clientY: 100,
          force: true
        });

      // Simular mouseup en el destino
      cy.get('@targetColumn').trigger('mouseup', {
        button: 0,
        force: true
      });

      // Esperar a que se complete la actualización en el backend
      cy.wait('@updateCandidate').then((interception) => {
        expect(interception.request.body).to.have.property('applicationId', 101);
        expect(interception.request.body).to.have.property('currentInterviewStep', 2);
      });

      // Verificar que la tarjeta se movió a la nueva columna
      cy.get('[data-testid="stage-column"]')
        .eq(1)
        .find('[data-testid="candidate-card"]')
        .should('have.length', 2);

      // Verificar que la tarjeta ya no está en la columna original
      cy.get('[data-testid="stage-column"]')
        .eq(0)
        .find('[data-testid="candidate-card"]')
        .should('have.length', 0);
    });

    it('Debe mantener el estado si falla la actualización en el backend', () => {
      // Interceptar la actualización para que falle
      cy.intercept({
        method: 'PUT',
        url: '**/candidates/1'
      }, {
        statusCode: 500,
        body: {
          error: 'Server error'
        }
      }).as('updateCandidateFail');

      // Verificar que la tarjeta origen existe y está en la posición correcta
      cy.get('[data-testid="stage-column"]')
        .eq(0)
        .find('[data-testid="candidate-card"]')
        .first()
        .as('sourceCard');

      cy.get('@sourceCard')
        .should('be.visible')
        .find('[data-testid="candidate-name"]')
        .should('contain', 'Ana García');

      // Simular mousedown en el origen
      cy.get('@sourceCard').trigger('mousedown', {
        button: 0,
        force: true
      });

      // Simular mousemove inicial
      cy.get('@sourceCard').trigger('mousemove', {
        button: 0,
        clientX: 100,
        clientY: 100,
        force: true
      });

      // Simular mousemove al destino
      cy.get('[data-testid="stage-column"]')
        .eq(1)
        .as('targetColumn')
        .trigger('mousemove', {
          button: 0,
          clientX: 300,
          clientY: 100,
          force: true
        });

      // Simular mouseup en el destino
      cy.get('@targetColumn').trigger('mouseup', {
        button: 0,
        force: true
      });

      // Esperar a que falle la actualización
      cy.wait('@updateCandidateFail');

      // Verificar que la tarjeta volvió a su posición original
      cy.get('[data-testid="stage-column"]')
        .eq(0)
        .find('[data-testid="candidate-card"]')
        .should('have.length', 1)
        .find('[data-testid="candidate-name"]')
        .should('contain', 'Ana García');

      // Verificar que la tarjeta no está en la columna destino
      cy.get('[data-testid="stage-column"]')
        .eq(1)
        .find('[data-testid="candidate-card"]')
        .should('have.length', 1)
        .find('[data-testid="candidate-name"]')
        .should('contain', 'Carlos Rodríguez');
    });
  });
}); 