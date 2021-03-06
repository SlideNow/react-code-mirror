'use strict';
var React = require('react');
var isMobile = require('./utils/isMobile')();
var CodeMirror;
var jsLintAddon;
var index = 0;
var length = 0;
var initCount = 0;

if (!isMobile) {
  CodeMirror = require('codemirror');
  require('./mode/javascript')(CodeMirror);
  require('./addons/lint')(CodeMirror);
  require('./addons/edit/matchBrackets')(CodeMirror);
  require('./addons/edit/closeBrackets')(CodeMirror);
  jsLintAddon = require('./addons/lint/javascript');
}

var CodeMirrorEditor = React.createClass({

  propTypes: {
    className: React.PropTypes.string,
    config: React.PropTypes.object,
    defaultValue: React.PropTypes.string,
    forceTextArea: React.PropTypes.bool,
    linter: React.PropTypes.func,
    onChange: React.PropTypes.func,
    readOnly: React.PropTypes.bool,
    style: React.PropTypes.object,
    textAreaStyle: React.PropTypes.object,
    textAreaClass: React.PropTypes.string,
    textAreaClassName: React.PropTypes.string,
    value: React.PropTypes.string
  },

  getInitialState: function() {
    return { isControlled: typeof this.props.value !== 'undefined' };
  },

  componentDidMount: function() {
    var isTextArea = this.props.forceTextArea || isMobile;
    var config = this.props.config;
    if (isTextArea) {
      return;
    }

    jsLintAddon(CodeMirror, this.props.linter);
    this._editor =
      CodeMirror.fromTextArea(this.refs.editor.getDOMNode(), this.props);
    this._editor.on('change', this._handleChange);
    if (config) {
      Object.keys(config).map(function(prop) {
        var args = config[prop];
        if (!Array.isArray(args)) {
          args = [args];
        }
        if (prop.indexOf('set') !== -1) {
          return this._editor[prop].apply(this._editor, args);
        }
        args.unshift(prop);
        this._editor.setOption.apply(this._editor, args);
      }.bind(this));
    }
  },

  componentWillReceiveProps: function(nextProps) {
    initCount++;
    //content init with empty store,reset content when store content first time emitchange!
    if(initCount >= 2){
      if(index != nextProps.index || length != nextProps.content.length) {
          index = nextProps.index;
          length = nextProps.content.length;
          var value = nextProps.content[index - 1].text;
          if (this._editor) {
            if (value != null) {
              if (this._editor.getValue() !== value) {
                this._editor.setValue(value);
              }
            }
          }
      }
    }
  },

  _handleChange: function(doc,change) {
    delete change['from']
    delete change['to']
    if (this._editor) {
      var value = this._editor.getValue();

      if (value !== this.props.value) {
        if (this.props.onChange) {
          this.props.onChange({target: {value: value}, change: change});
        }

        if (this._editor.getValue() !== this.props.value) {
          if (this.state.isControlled) {
            this._editor.setValue(this.props.value);
          } else {
            this.props.value = value;
          }
        }
      }
    }
  },

  render: function() {
    var editor = React.createElement('textarea', {
      ref: 'editor',
      value: this.props.value,
      readOnly: this.props.readOnly,
      defaultValue: this.props.defaultValue,
      onChange: this.props.onChange,
      style: this.props.textAreaStyle,
      className: this.props.textAreaClassName || this.props.textAreaClass
    });

    return React.createElement('div', {
      style: this.props.style,
      className: this.props.className
    }, editor);
  }
});

module.exports = CodeMirrorEditor;
