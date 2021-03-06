/*
    The Conflict of Interest (COI) module of Kuali Research
    Copyright © 2015 Kuali, Inc.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>
*/

import React from 'react/addons'; //eslint-disable-line no-unused-vars
import {ResponsiveComponent} from '../../ResponsiveComponent';
import {merge} from '../../../merge';
import {DisclosureActions} from '../../../actions/DisclosureActions';
import {Project} from './Project';
import {Entity} from './Entity';
import {Toggle} from '../Toggle';
import {Instructions} from '../Instructions';
import {COIConstants} from '../../../../../COIConstants';
import ConfigStore from '../../../stores/ConfigStore';

export class Relationships extends ResponsiveComponent {
  constructor() {
    super();
    this.commonStyles = {};

    this.openNext = this.openNext.bind(this);
    this.openPrevious = this.openPrevious.bind(this);
    this.getEntityDeclarations = this.getEntityDeclarations.bind(this);
    this.getProjectDeclarations = this.getProjectDeclarations.bind(this);
    this.isProjectDeclarationOpen = this.isProjectDeclarationOpen.bind(this);
    this.isEntityDeclarationOpen = this.isEntityDeclarationOpen.bind(this);
    this.viewChanged = this.viewChanged.bind(this);
  }

  shouldComponentUpdate() { return true; }

  openNext(currentIndex, type) {
    if (type === 'PROJECT') {
      let currentId = this.props.projects[currentIndex].id;
      DisclosureActions.toggleDeclaration(currentId, type);
      let nextId;
      if (this.props.projects[currentIndex + 1]) {
        nextId = this.props.projects[currentIndex + 1].id;
        DisclosureActions.toggleDeclaration(nextId, type);
      }
    }
    else {
      let currentId = this.props.entities[currentIndex].id;
      DisclosureActions.toggleDeclaration(currentId, type);
      let nextId;
      if (this.props.entities[currentIndex + 1]) {
        nextId = this.props.entities[currentIndex + 1].id;
        DisclosureActions.toggleDeclaration(nextId, type);
      }
    }
  }

  openPrevious(currentIndex, type) {
    if (type === 'PROJECT') {
      let currentId = this.props.projects[currentIndex].id;
      DisclosureActions.toggleDeclaration(currentId, type);
      let previousId;
      if (this.props.projects[currentIndex - 1]) {
        previousId = this.props.projects[currentIndex - 1].id;
        DisclosureActions.toggleDeclaration(previousId, type);
      }
    }
    else {
      let currentId = this.props.entities[currentIndex].id;
      DisclosureActions.toggleDeclaration(currentId, type);
      let previousId;
      if (this.props.entities[currentIndex - 1]) {
        previousId = this.props.entities[currentIndex - 1].id;
        DisclosureActions.toggleDeclaration(previousId, type);
      }
    }
  }

  getEntityDeclarations(id) {
    if (this.props.declarations) {
      return this.props.declarations.filter(element => {
        return element.finEntityId === id;
      });
    }
    else {
      return [];
    }
  }

  getProjectDeclarations(id) {
    if (this.props.declarations) {
      return this.props.declarations.filter(element => {
        return element.projectId === id;
      });
    }
    else {
      return [];
    }
  }

  isProjectDeclarationOpen(id) {
    if (this.props.declarationStates && this.props.declarationStates.projects) {
      let state = this.props.declarationStates.projects[id];
      return (state && state.open);
    }
    else {
      return false;
    }
  }

  isEntityDeclarationOpen(id) {
    if (this.props.declarationStates && this.props.declarationStates.entities) {
      let state = this.props.declarationStates.entities[id];
      return (state && state.open);
    }
    else {
      return false;
    }
  }

  viewChanged(newView) {
    DisclosureActions.changeDeclarationView(newView);
  }

  renderMobile() {}

  renderDesktop() {
    let desktopStyles = {
      container: {
        overflow: 'hidden'
      },
      content: {
        padding: '46px 0 0 50px'
      }
    };
    let styles = merge(this.commonStyles, desktopStyles);

    let projectView = this.props.view === 0;
    let relationshipNodes = [];
    let declarations;
    if (projectView) {
      for (let i = 0; i < this.props.projects.length; i++) {
        declarations = this.getProjectDeclarations(this.props.projects[i].id);

        relationshipNodes.push(
          <Project
            declarations={declarations}
            entities={this.props.entities}
            title={this.props.projects[i].name}
            type={ConfigStore.getProjectTypeString(this.props.projects[i].typeCd)}
            role={this.props.projects[i].roleCd}
            sponsor={this.props.projects[i].sponsorName}
            projectId={this.props.projects[i].id}
            declarationTypes={this.props.declarationTypes}
            open={this.isProjectDeclarationOpen(this.props.projects[i].id)}
            onNext={this.openNext}
            id={i}
            projectCount={this.props.projects.length}
            onPrevious={this.openPrevious}
            key={this.props.projects[i].id}
          />
        );
      }
    }
    else {
      this.props.entities.filter(entity => {
        return entity.active === 1;
      }).forEach((entity, index) =>{
        declarations = this.getEntityDeclarations(entity.id);

        relationshipNodes.push(
          <Entity
            entity={entity}
            declarations={declarations}
            projects={this.props.projects}
            title={entity.name}
            declarationTypes={this.props.declarationTypes}
            open={this.isEntityDeclarationOpen(entity.id)}
            onNext={this.openNext}
            onPrevious={this.openPrevious}
            id={index}
            entityCount={this.props.entities.length}
            key={entity.id}
          />
        );
      });
    }

    let instructionText = window.config.general.instructions[COIConstants.INSTRUCTION_STEP.PROJECT_DECLARATIONS];
    let instructions = (
      <Instructions
        text={instructionText}
        collapsed={!this.props.instructionsShowing}
      />
    );

    return (
      <div style={merge(styles.container, this.props.style)}>
        {instructions}

        <div style={styles.content}>
          <div style={{textAlign: 'right'}}>
            <Toggle
              values={[{code: 0, description: 'Project View'}, {code: 1, description: 'SFI View'}]}
              selected={this.props.view}
              onChange={this.viewChanged}
              style={{marginBottom: 18}}
            />
          </div>

          {relationshipNodes}
        </div>
      </div>
    );
  }
}
