import React from 'react/addons';
import {merge} from '../../merge';
import {ResponsiveComponent} from '../ResponsiveComponent';
import {Sidebar} from './Sidebar';
import {DisclosureHeader} from './DisclosureHeader';

export class Disclosure extends ResponsiveComponent {
	constructor(props) {
		super(props);
		this.commonStyles = {
		};

		// Set up steps for the sidebar
		this.steps = [
			{label: 'Questionnaire'},
			{label: 'Financial Entities'}
		];
		if (props.disclosuretype && props.disclosuretype.toLowerCase() === 'manual') {
			this.steps.push({label: 'Manual Event'});
		}
		if (props.disclosuretype && props.disclosuretype.toLowerCase() === 'travel') {
			this.steps.push({label: 'Travel Info'});
		}
		else {
			this.steps.push({label: 'Project Declarations'});
		}
		this.steps.push({label: 'Certification'});
	}

	renderMobile() {
		let mobileStyles = {
			container: {
				flex: '1',
				flexDirection: 'column',
				display: 'flex',
				height: 0,
				position: 'relative'
			},
			content: {
				backgroundColor: '#E8E9E6',
				flex: 1
			}
		};
		let styles = merge(this.commonStyles, mobileStyles);

		return (
			<div style={merge(styles.container, this.props.style)}>
				<Sidebar steps={this.steps} activestep={2} />
				<DisclosureHeader />
				<div style={styles.content}>
					Disclosure stuff will be here
				</div>
			</div>
		);
	}

	renderDesktop() {
		let desktopStyles = {
			container: {
			}
		};
		let styles = merge(this.commonStyles, desktopStyles);

		return (
			<span style={merge(styles.container, this.props.style)}>
				Desktop Disclosure
			</span>
		);
	}
}

Disclosure.contextTypes = {
	router: React.PropTypes.func
};