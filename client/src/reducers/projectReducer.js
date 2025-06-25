const projectReducer = (state, action) => {
  switch (action.type) {
    case 'GET_PROJECTS':
      return {
        ...state,
        projects: action.payload,
        loading: false
      };
    case 'GET_PROJECT':
      return {
        ...state,
        currentProject: action.payload,
        currentCollaborators: action.payload.collaborators || [],
        loading: false
      };
    case 'CREATE_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload],
        currentProject: action.payload,
        loading: false
      };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project._id === action.payload._id ? action.payload : project
        ),
        currentProject: action.payload,
        currentCollaborators: action.payload.collaborators || [],
        loading: false
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(
          project => project._id !== action.payload
        ),
        currentProject: null,
        loading: false
      };
    case 'UPDATE_CODE_CONTENT':
      return {
        ...state,
        currentProject: {
          ...state.currentProject,
          content: action.payload
        }
      };
    case 'PROJECT_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: true
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export default projectReducer;
