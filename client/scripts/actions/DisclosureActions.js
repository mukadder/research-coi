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

import alt from '../alt';

class _DisclosureActions {
  changeArchiveFilter(newValue) { this.dispatch(newValue); }

  loadArchivedDisclosures() { this.dispatch(); }

  changeArchivedQuery(newQuery) { this.dispatch(newQuery); }

  loadDisclosureSummaries() { this.dispatch(); }

  loadDisclosureData(disclosureType) {this.dispatch(disclosureType); }

  toggleInstructions() { this.dispatch(); }

  submitQuestion(question) { this.dispatch(question); }

  answerQuestion(question) { this.dispatch(question); }

  answerMultiple(question) { this.dispatch(question); }

  answerEntityQuestion(question) {this.dispatch(question); }

  answerEntityMultiple(question) { this.dispatch(question); }

  previousQuestion() { this.dispatch(); }

  setCurrentQuestion(newQuestionId) { this.dispatch(newQuestionId); }

  nextStep() { this.dispatch(); }

  newEntityInitiated() { this.dispatch(); }

  setInProgressEntityName(newNameValue) { this.dispatch(newNameValue); }

  entityFormNextClicked(entityId) { this.dispatch(entityId); }

  entityFormBackClicked(entityId) { this.dispatch(entityId); }

  setEntityActiveStatus(active, id) {
    this.dispatch({
      id: id,
      active: active
    });
  }

  setEntityType(newValue, id) {
    this.dispatch({
      id: id,
      type: newValue
    });
  }

  setEntityPublic(newValue, id) {
    this.dispatch({
      id: id,
      isPublic: newValue
    });
  }

  setEntityIsSponsor(newValue, id) {
    this.dispatch({
      id: id,
      isSponsor: newValue
    });
  }

  setEntityDescription(newValue, id) {
    this.dispatch({
      id: id,
      description: newValue
    });
  }

  setEntityRelationshipPerson(person) { this.dispatch(person); }

  setEntityRelationshipTravelAmount(amount) { this.dispatch(amount); }

  setEntityRelationshipTravelDestination(destination) { this.dispatch(destination); }

  setEntityRelationshipTravelStartDate(date) { this.dispatch(date); }

  setEntityRelationshipTravelEndDate(date) { this.dispatch(date); }

  setEntityRelationshipTravelReason(reason) { this.dispatch(reason); }

  setEntityRelationshipRelation(relation) { this.dispatch(relation); }

  setEntityRelationshipType(type) { this.dispatch(type); }

  setEntityRelationshipAmount(amount) { this.dispatch(amount); }

  setEntityRelationshipComment(comment) { this.dispatch(comment); }

  addEntityRelationship(entityId) {
    this.dispatch(entityId);
  }

  removeEntityRelationship(relationId, entityId) {
    this.dispatch({
      relationId: relationId,
      entityId: entityId
    });
  }

  entityFormClosed(entity) { this.dispatch(entity); }

  saveInProgressEntity(entity) { this.dispatch(entity); }

  changeActiveEntityView(newView) { this.dispatch(newView); }

  updateEntityFormOpened(id) { this.dispatch(id); }

  editEntity(id) { this.dispatch(id); }

  undoEntityChanges(snapshot) { this.dispatch(snapshot); }

  toggleDeclaration(id, type) {
    this.dispatch({
      entityId: id,
      type: type
    });
  }

  changeDeclarationView(newView) { this.dispatch(newView); }

  entityRelationChosen(relationType, finEntityId, projectId, typeCd) {
    this.dispatch({
      relationType: relationType,
      finEntityId: finEntityId,
      projectId: projectId,
      typeCd: typeCd
    });
  }

  declarationCommentedOn(relationType, finEntityId, projectId, comments) {
    this.dispatch({
      relationType: relationType,
      finEntityId: finEntityId,
      projectId: projectId,
      comments: comments
    });
  }

  setAllForEntity(finEntityId, newValue) {
    this.dispatch({
      finEntityId: finEntityId,
      newValue: newValue
    });
  }

  setAllForProject(type, projectId, newValue) {
    this.dispatch({
      type: type,
      projectId: projectId,
      newValue: newValue
    });
  }

  toggleConfirmationMessage() { this.dispatch(); }

  manualTypeSelected(disclosureId, manualType) {
    this.dispatch({
      disclosureId: disclosureId,
      manualType: manualType
    });
  }

  saveManualEvent(disclosureId, id, title, sponsor, role, amount, projectType, startDate, endDate) {
    this.dispatch({
      disclosureId: disclosureId,
      id: id,
      title: title,
      sponsor: sponsor,
      role: role,
      amount: amount,
      projectType: projectType,
      startDate: startDate,
      endDate: endDate
    });
  }

  doneEditingManualEvent(disclosureId) { this.dispatch(disclosureId); }

  jumpToStep(step) {
    this.dispatch(step);
  }

  setArchiveSort(field, direction) {
    this.dispatch({
      field: field,
      direction: direction
    });
  }

  loadArchivedDisclosureDetail(id) { this.dispatch(id); }

  turnOnValidation(step) { this.dispatch(step); }

  turnOffValidation(step) { this.dispatch(step); }

  certify(value) { this.dispatch(value); }

  submitDisclosure() { this.dispatch(); }

  addEntityAttachments(files, entityId) { this.dispatch({files: files, entityId: entityId}); }

  deleteEntityAttachment(index, entityId) { this.dispatch({index: index, entityId: entityId}); }

  addDisclosureAttachment(files) { this.dispatch(files); }

  deleteDisclosureAttachment(index) { this.dispatch(index); }

  deleteAnswersTo(toDelete) { this.dispatch(toDelete); }
}

export let DisclosureActions = alt.createActions(_DisclosureActions);
