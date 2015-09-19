import React from 'react/addons'; //eslint-disable-line no-unused-vars

export class RadioControl extends React.Component {
  constructor() {
    super();

    this.answer = this.answer.bind(this);
  }

  answer(evt) {
    this.props.onChange(evt);
  }

  render() {
    let styles = {
      option: {
        display: 'inline-block',
        marginRight: 30
      },
      radio: {
        width: 22,
        height: '4em'
      },
      label: {
        cursor: 'pointer'
      }
    };

    let options = this.props.options.map(option=> {
      return (
      <span style={styles.option}>
            <div>
              <input
              key={option}
              id={'multi_' + option}
              value={option}
              checked={this.props.answer === option}
              onChange={this.answer}
              type="radio"
              style={styles.radio}/>
            </div>
            <label htmlFor={'multi_' + option} style={styles.label}>{option}</label>
      </span>
      );
    });

    return (
      <div>
        {options}
      </div>
    );
  }
}
