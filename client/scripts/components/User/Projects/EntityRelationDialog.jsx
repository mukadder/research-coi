import React from 'react/addons'; //eslint-disable-line no-unused-vars
import {ResponsiveComponent} from '../../ResponsiveComponent';
import {merge} from '../../../merge';
import {DisclosureActions} from '../../../actions/DisclosureActions';
import {ProjectRelation} from './ProjectRelation';
import {KButton} from '../../KButton';
import {ProminentButton} from '../../ProminentButton';

export class EntityRelationDialog extends ResponsiveComponent {
  constructor() {
    super();
    this.commonStyles = {};

    this.onNext = this.onNext.bind(this);
    this.onPrevious = this.onPrevious.bind(this);
    this.findDeclarationTypeByProject = this.findDeclarationTypeByProject.bind(this);
    this.findCommentByProject = this.findCommentByProject.bind(this);
    this.setAll = this.setAll.bind(this);
  }

  shouldComponentUpdate() { return true; }

  onNext() {
    this.props.onNext(this.props.id, 'ENTITY');
  }

  onPrevious() {
    this.props.onPrevious(this.props.id, 'ENTITY');
  }

  findDeclarationTypeByProject(id) {
    let declaration = this.props.declarations.find((element) => {
      return element.projectId === id;
    });

    if (declaration) {
      return declaration.typeCd;
    }
    else {
      return null;
    }
  }

  findCommentByProject(id) {
    let relation = this.props.declarations.find((element) => {
      return element.projectId === id;
    });

    if (relation) {
      return relation.comments;
    }
    else {
      return null;
    }
  }

  setAll() {
    DisclosureActions.setAllForEntity(this.props.finEntityId, parseInt(this.refs.setAllSelect.getDOMNode().value));
  }

  renderMobile() {}

  renderDesktop() {
    let desktopStyles = {
      container: {
        backgroundColor: '#c1c1c1'
      },
      content: {
        padding: '25px 25px 15px 25px',
        position: 'relative',
        backgroundColor: 'white'
      },
      instructions: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 15
      },
      setAllButton: {
        width: 'initial',
        margin: '7px 10px 7px 0'
      },
      heading: {
        display: 'inline-block',
        fontSize: 12,
        fontWeight: 'bold'
      },
      headings: {
        marginTop: 25,
        paddingBottom: 10
      },
      buttons: {
        backgroundColor: 'white',
        padding: 15,
        textAlign: 'right',
        borderTop: '1px solid #C3C3C3'
      },
      spacer: {
        display: 'inline-block',
        width: 10,
        borderRight: '1px solid #666',
        height: 32,
        verticalAlign: 'middle'
      },
      button: {
        margin: '0 10px 0 10px',
        padding: 8,
        minWidth: 90,
        width: 'initial'
      }
    };
    let styles = merge(this.commonStyles, desktopStyles);

    let projectRelations = [];
    this.props.projects.forEach(project => {
      projectRelations.push(
        <ProjectRelation
          project={project}
          finEntityId={this.props.finEntityId}
          typeCd={this.findDeclarationTypeByProject(project.id)}
          comments={this.findCommentByProject(project.id)}
          declarationTypes={this.props.declarationTypes}
          key={project.id}
        />
      );
    });

    let declarationTypeOptions = this.props.declarationTypes.map(option =>{
      return (
        <option key={option.typeCd} value={option.typeCd}>{option.description}</option>
      );
    });

    let navButtons = [];
    if (this.props.entityCount > 0) {
      if (this.props.id > 0) {
        navButtons.push(
        <ProminentButton key='previous' onClick={this.onPrevious} style={styles.button}>Previous Project ^</ProminentButton>
        );
      }
      if (this.props.id < this.props.entityCount - 1) {
        navButtons.push(
        <ProminentButton key='next' onClick={this.onNext} style={styles.button}>Next Project v</ProminentButton>
        );
      }
    }

    return (
      <div style={merge(styles.container, this.props.style)} >
        <div style={styles.content}>
          <div style={styles.instructions}>
            Indicate how each project is related to this financial entity - {this.props.title}:
          </div>
          <div>
            <KButton onClick={this.setAll} style={styles.setAllButton}>Set All:</KButton>
            to:
            <select ref="setAllSelect" style={{marginLeft: 10}}>
              {declarationTypeOptions}
            </select>
          </div>
          <div style={styles.headings}>
            <span style={merge(styles.heading, {width: '25%'})}>Project</span>
            <span style={merge(styles.heading, {width: '30%'})}>Reporter Relationship</span>
            <span style={merge(styles.heading, {width: '45%'})}>Reporter Comments</span>
          </div>
          {projectRelations}
        </div>
        <div style={styles.buttons}>
          <div>
            {navButtons}
            <span style={styles.spacer} />
            <ProminentButton onClick={this.props.onSave} style={styles.button}>Done</ProminentButton>
          </div>
        </div>
      </div>
    );
  }
}
