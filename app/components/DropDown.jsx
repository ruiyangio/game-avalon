import React from 'react';
import PropTypes from 'prop-types';
import '../css/dropdown.scss';

export default class DropDown extends React.Component {
    static get propTypes() {
        return {
            labelText: PropTypes.string,
            theme: PropTypes.string,
            list: PropTypes.array,
            selectionChangeHandler: PropTypes.func,
            selectedItem: PropTypes.object,
            'selectedItem.text': PropTypes.string,
            'selectedItem.value': PropTypes.any
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            listVisible: false
        };

        this.selectItem = this.selectItem.bind(this);
        this.toggleList = this.toggleList.bind(this);
        this.setWrapperRef = this.setWrapperRef.bind(this); 
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.hideList = this.hideList.bind(this);
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    setWrapperRef(node) {
        this.wrapperRef = node;
    }

    handleClickOutside(event) {
        if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
            this.hideList();
        }
    }

    getClassName() {
        const themes = {
            'default': 'drop-down'
        };

        if (themes[this.props.theme]) {
            return themes[this.props.theme];
        }
        else {
            return themes['default'];
        }
    }

    selectItem(item) {
        this.props.selectionChangeHandler(item);
        this.toggleList();
    }

    toggleList() {
        const isListVisible = this.state.listVisible;

        this.setState({
            listVisible: !isListVisible
        });
    }

    hideList() {
        this.setState({
            listVisible: false
        });
    }

    renderList() {
        const self = this;
        let items = [];
        for (let i = 0; i < self.props.list.length; i++) {
            let item = self.props.list[i];
            items.push(
                <div key={ i } className='drop-down-list--item' onClick={ () => self.selectItem(item) }>
                    <span>{ item.text }</span>
                </div>
            );
        }

        return items;
    }

    render() {
        return (
            <div className={ this.getClassName() } ref={ this.setWrapperRef }>
                <div className='drop-down-label'>
                    <span>{ this.props.labelText }</span>
                </div>
                <div className={ 'drop-down-box' + (this.state.listVisible ? ' drop-down-list__show' : ' drop-down-list__hidden') }>
                    <div className='drop-down-selected' onClick={ this.toggleList }>
                        <span>{ this.props.selectedItem.text }</span>
                    </div>
                    <div className={ 'drop-down-list' }>
                        { this.renderList() }
                    </div>
                </div>
            </div>
        );
    }
}
