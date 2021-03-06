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

import React from 'react/addons';
import {ProminentButton} from '../../ProminentButton';
import {TravelLogActions} from '../../../actions/TravelLogActions';
import {TravelLogStore} from '../../../stores/TravelLogStore';
import TextField from '../TextField';
import CurrencyField from '../CurrencyField';
import DateRangeField from '../DateRangeField';

export class TravelLogForm extends React.Component {
    constructor() {
      super();

      this.addEntry = this.addEntry.bind(this);
      this.updateStartDate = this.updateStartDate.bind(this);
      this.updateEndDate = this.updateEndDate.bind(this);
    }

    addEntry() {
      let validationErrors = TravelLogStore.getErrors();
      let isValid = Object.keys(validationErrors).length === 0;
      if (isValid) {
        TravelLogActions.addEntry();
      } else {
        TravelLogActions.turnOnValidations();
      }
    }

    updateField(evt) {
      TravelLogActions.updateTravelLog(evt.target.id, evt.target.value);
    }

    updateStartDate(newValue) {
      TravelLogActions.updateTravelLog('startDate', newValue);
    }

    updateEndDate(newValue) {
      TravelLogActions.updateTravelLog('endDate', newValue);
    }

    render() {
      let styles = {
        container: {
          margin: '44px 50px'
        },
        textField: {
          container: {
            display: 'inline-block',
            width: '33%'
          },
          input: {
            padding: '2px 8px',
            fontSize: 16,
            borderRadius: 5,
            border: '1px solid #ccc',
            height: 30,
            width: '95%'
          },
          label: {
            marginBottom: 5,
            fontWeight: '500'
          }
        }
      };

      let errors = TravelLogStore.getErrors();

      return (
        <div style={styles.container}>
          <TextField
            id='entityName'
            label='ENTITY NAME'
            onChange={this.updateField}
            name="Entity Name"
            styles={styles.textField}
            value={this.props.entry.entityName}
            invalid={this.props.validating && errors.entityName ? true : false}
          />
          <CurrencyField
            id='amount'
            label='AMOUNT'
            onChange={this.updateField}
            name="Amount"
            styles={styles.textField}
            value={this.props.entry.amount}
            invalid={this.props.validating && errors.amount ? true : false}
          />
          <TextField
            id='destination'
            label='DESTINATION'
            onChange={this.updateField}
            name="Destinantion"
            styles={styles.textField}
            value={this.props.entry.destination}
            invalid={this.props.validating && errors.destination ? true : false}
          />
          <DateRangeField
            id='dateRange'
            label='DATE RANGE'
            onStartDateChange={this.updateStartDate}
            onEndDateChange={this.updateEndDate}
            styles={styles.textField}
            startDate={this.props.entry.startDate}
            endDate={this.props.entry.endDate}
            startDateInvalid={this.props.validating && errors.startDate ? true : false}
            endDateInvalid={this.props.validating && errors.endDate ? true : false}
          />
          <TextField
            id='reason'
            label='REASON'
            onChange={this.updateField}
            name="Reason"
            styles={styles.textField}
            value={this.props.entry.reason}
            invalid={this.props.validating && errors.reason ? true : false}
          />
          <div style={styles.textField.container}>
            <ProminentButton onClick={this.addEntry}>+ ADD</ProminentButton>
          </div>
          </div>
      );
    }
}
