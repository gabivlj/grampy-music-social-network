const initialState = {
	albums: [],
	loading: false,
	// To be honest I think we should refactor this things
	loadingSearch: false,
	searchData: {
		albums: { loading: false, list: [] },
		artists: { loading: false, list: [] },
		playlists: { loading: false, list: [] },
		profiles: { loading: false, list: [] },
		cleaned: false
	}
};

export default (state = initialState, action) => {
	switch (action.type) {
		case 'SEARCH_ALBUMS':
			return {
				...state,
				albums: [...action.payload],
				loading: false
			};
		case 'SET_LOADING_SEARCH':
			return {
				...state,
				albums: [],
				loading: true
			};
		case 'SEARCH_ALBUMS_FOR_SEARCH':
			return {
				...state,
				loadingSearch: false,
				searchData: {
					...state.searchData,
					albums: { list: [...action.payload], loading: false }
				}
			};
		case 'SEARCH_ARTISTS_FOR_SEARCH':
			return {
				...state,
				loadingSearch: false,
				searchData: {
					...state.searchData,
					artists: {
						list: [...(action.payload ? action.payload : [])],
						loading: false
					}
				}
			};
		case 'SEARCH_PLAYLISTS_FOR_SEARCH':
			return {
				...state,
				loadingSearch: false,
				searchData: {
					...state.searchData,
					playlists: { list: [...action.payload], loading: false }
				}
			};
		case 'SEARCH_PROFILES_FOR_SEARCH':
			return {
				...state,
				loadingSearch: false,
				searchData: {
					...state.searchData,
					profiles: {
						list: [...(action.payload ? action.payload : [])],
						loading: false
					}
				}
			};
		case 'CLEAN_SEARCH_PAGE':
			return {
				...state,
				searchData: {
					albums: { loading: false, list: [] },
					artists: { loading: false, list: [] },
					playlists: { loading: false, list: [] },
					profiles: { loading: false, list: [] },
					cleaned: true
				}
			};
		case 'SET_LOADING_SEARCH_PAGE':
			delete state.searchData[action.payload];
			return {
				...state,
				searchData: {
					[action.payload]: {
						loading: true,
						list: []
					},
					...state.searchData
				}
			};
		case 'POPULATE_SEARCH':
			return {
				...state,
				searchData: {
					...state.searchData,
					cleaned: false
				}
			};
		default:
			return state;
	}
};
