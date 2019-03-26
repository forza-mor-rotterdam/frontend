import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose, bindActionCreators } from 'redux';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectKtoContainer from './selectors';
import reducer from './reducer';
import saga from './saga';
import './style.scss';

import { updateKto, requestKtaAnswers, checkKto, storeKto } from './actions';
import KtoForm from './components/KtoForm';

export class KtoContainer extends React.Component {
  componentWillMount() {
    this.props.requestKtaAnswers(this.props.yesNo);
    this.props.checkKto(this.props.uuid);
  }

  static getHeader(type) {
    switch (type) {
      case 'ja':
        return <h1>Ja, ik ben tevreden met de behandeling van mijn melding</h1>;

      case 'nee':
        return <h1>Nee, ik ben niet tevreden met de behandeling van mijn melding</h1>;

      case 'finnished':
        return (
          <div>
            <h1>Bedankt voor uw feedback!</h1>
            <p>We zijn voortdurend bezig onze dienstverlening te verbeteren.</p>
          </div>
        );

      case 'not found':
        return (
          <div>
            <h1>Niet gevonden</h1>
            <p>Het uuid kan niet worden gevonden. Misschien heeft u een type fout gemaakt?</p>
          </div>
        );

      case 'too late':
        return (
          <div>
            <h1>Helaas, de mogelijkheid om feedback te geven is verlopen</h1>
            <p>Na het afhandelend van uw melding heeftb u 2 weken de gelegenheid om feedback te geven.</p>
          </div>
        );

      case 'filled out':
        return (
          <div>
            <h1>Er is al feedback gegeven voor deze melding</h1>
            <p>Nogmaals bedankt voor uw feedback. We zijn voortdurend bezig onze dienstverlening te verbeteren.</p>
          </div>
        );
      default:
        return (
          <div>
            <h1>Een onbekende fout heeft zich voor gedaan.</h1>
          </div>
        );
    }
  }

  render() {
    const { ktoContainer, onUpdateKto, onStoreKto, yesNo } = this.props;
    return (
      <div className="kto-container">
        <div className="container">
          <div className="row">
            <div className="col-12">
              {!ktoContainer.formError ?
                <div>
                  {ktoContainer.ktoFinished ?
                    <div>
                      {KtoContainer.getHeader('finnished')}
                    </div> :
                    <div>
                      {KtoContainer.getHeader(yesNo)}

                      <KtoForm
                        ktoContainer={ktoContainer}
                        onUpdateKto={onUpdateKto}
                        onStoreKto={onStoreKto}
                      />

                    </div>
                }
                </div>
            :
                <div>
                  {KtoContainer.getHeader(ktoContainer.formError)}
                </div>
              }

            </div>
          </div>
        </div>
      </div>
    );
  }
}

KtoContainer.defaultProps = {
  ktoContainer: {
    formError: false,
    form: {},
    answers: {}
  }
};

KtoContainer.propTypes = {
  uuid: PropTypes.string.isRequired,
  yesNo: PropTypes.string.isRequired,
  ktoContainer: PropTypes.object,

  onUpdateKto: PropTypes.func.isRequired,
  onStoreKto: PropTypes.func.isRequired,
  requestKtaAnswers: PropTypes.func.isRequired,
  checkKto: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
  ktoContainer: makeSelectKtoContainer(),
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
  onUpdateKto: updateKto,
  onStoreKto: storeKto,
  requestKtaAnswers,
  checkKto
}, dispatch);

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'ktoContainer', reducer });
const withSaga = injectSaga({ key: 'ktoContainer', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(KtoContainer);
