/*
 * Copyright (c) 2017 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createMemoryHistory } from 'history';
import renderCallback from '../utils/renderCallback';

const Wizard = props => {
  const [state, setState] = useState({
    step: {
      id: null,
    },
    steps: [],
  });

  const history = props.history || createMemoryHistory();

  useEffect(() => {
    const unListen = history.listen(({ pathname }) => setState({ step: pathToStep(pathname) }));

    if (props.onNext) {
      const { init, ...wizard } = getChildContext().wizard;
      props.onNext(wizard);
    };

    return () => unListen();
  }, []);


  const basename = () => {
    return `${props.basename}/`;
  };

  const ids = () => {
    return state.steps.map(s => s.id);
  };

  const nextStep = () => {
    return ids[ids.indexOf(state.step.id) + 1];
  };

  const pathToStep = pathname => {
    const id = pathname.replace(basename, '');
    const [step] = state.steps.filter(s => s.id === id);
    return step || state.step;
  };

  const init = steps => {
    setState({ steps }, () => {
      const step = pathToStep(history.location.pathname);
      if (step.id) {
        setState({ step });
      } else {
        history.replace(`${basename}${ids[0]}`);
      }
    });
  };

  const push = (step = nextStep) => history.push(`${basename}${step}`);
  const replace = (step = nextStep) => history.replace(`${basename}${step}`);

  const { init, ...wizard } = getChildContext().wizard;

  const next = () => {
    if (props.onNext) {
      props.onNext(getChildContext().wizard);
    } else {
      push();
    }
  };

  const getChildContext = () => {
    return {
      wizard: {
        go: history.go,
        history: history,
        init: init,
        next: next,
        previous: history.goBack,
        push: push,
        replace: replace,
        ...state,
      },
    };
  };

  return renderCallback(props, wizard);
}

Wizard.propTypes = {
  basename: PropTypes.string,
  history: PropTypes.shape({
    entries: PropTypes.array,
    go: PropTypes.func,
    goBack: PropTypes.func,
    listen: PropTypes.func,
    location: PropTypes.object,
    push: PropTypes.func,
    replace: PropTypes.func,
  }),
  onNext: PropTypes.func,
};

Wizard.defaultProps = {
  basename: '',
  history: null,
  onNext: null,
  render: null,
};

Wizard.childContextTypes = {
  wizard: PropTypes.object,
};

export default Wizard;
