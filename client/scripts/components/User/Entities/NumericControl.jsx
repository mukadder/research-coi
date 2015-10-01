import React from 'react/addons'; //eslint-disable-line no-unused-vars

export class NumericControl extends React.Component {
  constructor() {
    super();

    this.answer = this.answer.bind(this);
    this.submit = this.submit.bind(this);
  }

  answer(evt) {
    this.props.onChange(evt, this.props.questionId);
  }

  submit() {
    this.props.onClick(this.props.answer, this.props.questionId);
  }

  render() {
    let styles = {
      container: {
        width: '100%',
        display: 'inline-block'
      },
      textbox: {
        padding: 6,
        width: '80%',
        border: '1px solid #B0B0B0'
      },
      value: {
        color: 'black',
        fontWeight: 'bold'
      },
      invalidError: {
        fontSize: 10,
        marginTop: 2
      }
    };

    let requiredFieldError;
    if (this.props.invalid) {
      requiredFieldError = (
      <div style={styles.invalidError}>Required Field</div>
      );
    }

    if (this.props.readonly) {
      return (
        <div style={styles.value}>
          {this.props.answer}
        </div>
      );
    }

    return (
    <div>
      <div style={styles.container}>
        <input style={styles.textbox} type="number" id="number" onChange={this.answer} value={this.props.answer} />
      </div>
      {requiredFieldError}
    </div>
    );
  }
}