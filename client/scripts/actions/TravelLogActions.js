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

class _TravelLogActions {
  addEntry() { this.dispatch(); }

  updateTravelLog(field, value) {
    this.dispatch({
      field: field,
      value: value
    });
  }

  loadTravelLogEntries() {
    this.dispatch();
  }

  sortColumnChanged(value) { this.dispatch(value); }

  sortDirectionChanged(value) { this.dispatch(value); }

  filterChanged(value) { this.dispatch(value); }

  turnOnValidations() { this.dispatch(); }

  deleteEntry(relationshipId) { this.dispatch(relationshipId); }

  archiveEntry(relationshipId) { this.dispatch(relationshipId); }

  editEntry(relationshipId) { this.dispatch(relationshipId); }

  saveEntry(relationshipId) { this.dispatch(relationshipId); }

  cancelEntry(relationshipId) { this.dispatch(relationshipId); }

  updateEntry(field, value, relationshipId) { this.dispatch({field: field, value: value, relationshipId: relationshipId}); }
}
export let TravelLogActions = alt.createActions(_TravelLogActions);
