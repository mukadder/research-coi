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

import {AutoBindingStore} from './AutoBindingStore';
import {TravelLogActions} from '../actions/TravelLogActions.js';
import alt from '../alt';
import {processResponse, createRequest} from '../HttpUtils';

let cloneObject = original => {
  return JSON.parse(JSON.stringify(original));
};

class _TravelLogStore extends AutoBindingStore {
  constructor() {
    super(TravelLogActions);

    this.exportPublicMethods({
      getErrors: this.getErrors,
      validateEntry: this.validateEntry
    });

    this.entries = [];
    this.potentialEntry = {};
    this.sortColumn = 'name';
    this.sortDirection = 'ASCENDING';
    this.filter = 'all';
    this.validating = false;
    this.entryStates = {};
  }

  refreshTravelLogEntries() {
    createRequest().get('/api/coi/travel-log-entries/')
    .query({sortColumn: this.sortColumn})
    .query({sortDirection: this.sortDirection})
    .query({filter: this.filter})
    .end(processResponse((err, travelLog) => {
      if (!err) {
        this.entries = travelLog.body;
        this.emitChange();
      }
    }));
  }

  loadTravelLogEntries() {
    this.refreshTravelLogEntries();
  }

  sortColumnChanged(value) {
    this.sortColumn = value;
    this.refreshTravelLogEntries();
  }

  sortDirectionChanged(value) {
    this.sortDirection = value;
    this.refreshTravelLogEntries();
  }

  filterChanged(value) {
    this.filter = value;
    this.refreshTravelLogEntries();
  }

  updateTravelLog(data) {
    this.potentialEntry[data.field] = data.value;
  }

  addEntry() {
    createRequest().post('/api/coi/travel-log-entries')
      .type('application/json')
      .send(this.potentialEntry)
      .end(processResponse((err, returnEntry) => {
        if (!err) {
          this.entries.push(returnEntry.body);
          this.potentialEntry = {};
          this.validating = false;
          this.emitChange();
        }
      }));
  }

  getEntry(relationshipId) {
    return this.entries.find(entry => {
      return entry.relationshipId === relationshipId;
    });
  }

  editEntry(relationshipId) {
    if (!this.entryStates[relationshipId]) {
      this.entryStates[relationshipId] = {};
    }
    this.entryStates[relationshipId].editing = true;
    this.entryStates[relationshipId].snapshot = cloneObject(this.getEntry(relationshipId));
  }

  saveEntry(relationshipId) {
    let entryToSave = this.entries.find(entry => {
      return entry.relationshipId === relationshipId;
    });

    this.entryStates[relationshipId].editing = false;
    this.entryStates[relationshipId].snapshot = undefined;

    createRequest().put('/api/coi/travel-log-entries/' + relationshipId)
    .send(entryToSave)
    .end(processResponse(() => {}));
  }

  cancelEntry(relationshipId) {
    let index = this.entries.findIndex(entry => {
      return entry.relationshipId === relationshipId;
    });

    if (index >= 0) {
      this.entries[index] = this.entryStates[relationshipId].snapshot;
    }

    this.entryStates[relationshipId].editing = false;
    this.entryStates[relationshipId].snapshot = undefined;
  }

  updateEntry(data) {
    let entryToSave = this.entries.find(entry => {
      return entry.relationshipId === data.relationshipId;
    });

    entryToSave[data.field] = data.value;
  }

  turnOnValidations() {
    this.validating = true;
  }

  getErrors() {
    const storeState = this.getState();
    return this.validateEntry(storeState.potentialEntry);
  }

  validateEntry(entry) {
    let errors = {};

    if (!entry.entityName) {
      errors.entityName = 'Required Field';
    }

    if (!entry.amount) {
      errors.amount = 'Required Field';
    }

    if (!entry.destination) {
      errors.destination = 'Required Field';
    }

    if (!entry.startDate) {
      errors.startDate = 'Required Field';
    }

    if (!entry.endDate) {
      errors.endDate = 'Required Field';
    }

    if (entry.startDate && entry.endDate && entry.endDate < entry.startDate) {
      errors.startDate = 'Invalid Date Range';
      errors.endDate = 'Invalid Date Range';
    }

    if (!entry.reason) {
      errors.reason = 'Required Field';
    }

    return errors;
  }

  deleteEntry(relationshipId) {
    createRequest().del('/api/coi/travel-log-entries/' + relationshipId)
      .end(processResponse((err) => {
        if (!err) {
          this.entries = this.entries.filter(entry => {
            return entry.relationshipId !== relationshipId;
          });
          this.emitChange();
        }
      }));
  }

  archiveEntry(relationshipId) {
    createRequest().put('/api/coi/travel-log-entries/' + relationshipId)
      .send({active: false})
      .end(processResponse((err) => {
        if (!err) {
          this.entries = this.entries.filter(entry => {
            return entry.relationshipId !== relationshipId;
          });
          this.emitChange();
        }
      }));
  }

}

export let TravelLogStore = alt.createStore(_TravelLogStore, 'TravelLogStore');
