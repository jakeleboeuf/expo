// @flow
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  LayoutAnimation,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { withNavigation, withNavigationFocus, ThemeContext } from 'react-navigation';

import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import * as Kernel from '../kernel/Kernel';
import { StyledView } from './Views';

const SearchContainerHorizontalMargin = 10;
const SearchContainerWidth = Layout.window.width - SearchContainerHorizontalMargin * 2;

const SearchIcon = () => (
  <View style={styles.searchIconContainer}>
    <Ionicons name="ios-search" size={18} color="#ccc" />
  </View>
);

@withNavigation
class PlaceholderButtonSearchBar extends React.Component {
  static contextType = ThemeContext;

  render() {
    return (
      <View style={styles.container}>
        <TouchableWithoutFeedback
          hitSlop={{ top: 10, left: 10, bottom: 5, right: 10 }}
          onPress={this._handlePress}>
          <StyledView
            style={styles.searchContainer}
            lightBackgroundColor="#f2f2f2"
            darkBackgroundColor={Colors.dark.cardBackground}>
            <View pointerEvents="none" style={{ flex: 1 }}>
              <TextInput
                editable={false}
                placeholder="Find a project or enter a URL..."
                placeholderTextColor={this.context === 'dark' ? '#646464' : '#ccc'}
                placeholderStyle={styles.searchInputPlaceholderText}
                style={styles.searchInput}
              />
            </View>
            <SearchIcon />
          </StyledView>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  _handlePress = () => {
    this.props.navigation.navigate('Search');
  };
}

@withNavigation
@withNavigationFocus
export default class SearchBar extends React.Component {
  static contextType = ThemeContext;
  static PlaceholderButton = PlaceholderButtonSearchBar;

  _textInput: TextInput;

  state = {
    text: '',
    showCancelButton: false,
    inputWidth: Layout.window.width,
  };

  componentDidUpdate(prevProps) {
    if (!prevProps.isFocused && this.props.isFocused) {
      this._textInput && this._textInput.focus();
    }
  }

  render() {
    let { inputWidth, showCancelButton } = this.state;

    return (
      <View style={styles.container}>
        <StyledView
          style={[styles.searchContainer, { width: inputWidth }]}
          lightBackgroundColor="#f2f2f2"
          darkBackgroundColor={Colors.dark.cardBackground}>
          <TextInput
            autoFocus
            ref={view => {
              this._textInput = view;
            }}
            clearButtonMode="while-editing"
            onChangeText={this._handleChangeText}
            value={this.state.text}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            placeholder="Find a project or enter a URL..."
            placeholderTextColor={this.context === 'dark' ? '#646464' : '#ccc'}
            placeholderStyle={styles.searchInputPlaceholderText}
            onSubmitEditing={this._handleSubmit}
            style={[styles.searchInput, { color: this.context === 'dark' ? '#fff' : '#000' }]}
          />
          <SearchIcon />
        </StyledView>

        <View
          key={showCancelButton ? 'visible-cancel-button' : 'layout-only-cancel-button'}
          style={[styles.buttonContainer, { opacity: showCancelButton ? 1 : 0 }]}>
          <TouchableOpacity
            style={styles.button}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 20 }}
            onLayout={this._handleLayoutCancelButton}
            onPress={this._handlePressCancelButton}>
            <Text style={{ fontSize: 16, color: '#4E9BDE' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  _handleChangeText = (text: string) => {
    this.setState({ text });
    let emitter = this.props.navigation.getParam('emitter');
    if (!emitter) {
      return;
    }

    emitter && emitter.emit('change', text);
  };

  _handleSubmit = () => {
    this._textInput.blur();
  };

  _handlePressCancelButton = () => {
    this.props.navigation.goBack();
  };

  _handleLayoutCancelButton = (e: Object) => {
    if (this.state.showCancelButton) {
      return;
    }

    const cancelButtonWidth = e.nativeEvent.layout.width;

    requestAnimationFrame(() => {
      LayoutAnimation.configureNext({
        duration: 200,
        create: {
          type: LayoutAnimation.Types.linear,
          property: LayoutAnimation.Properties.opacity,
        },
        update: {
          type: LayoutAnimation.Types.spring,
          springDamping: 0.9,
          initialVelocity: 10,
        },
      });

      this.setState({
        showCancelButton: true,
        inputWidth: SearchContainerWidth - cancelButtonWidth,
      });
    });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  buttonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    paddingRight: 17,
    paddingLeft: 2,
  },
  searchContainer: {
    height: 30,
    width: SearchContainerWidth,
    borderRadius: 6,
    marginHorizontal: SearchContainerHorizontalMargin,
    marginTop: 10,
    paddingLeft: 27,
  },
  searchIconContainer: {
    position: 'absolute',
    left: 7,
    top: 6,
    bottom: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingTop: 1,
  },
  searchInputPlaceholderText: {},
});
