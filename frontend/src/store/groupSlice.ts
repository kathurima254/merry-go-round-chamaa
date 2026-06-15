import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GroupState {
  groups: any[];
  currentGroup: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: GroupState = {
  groups: [],
  currentGroup: null,
  loading: false,
  error: null,
};

const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    setGroups: (state, action: PayloadAction<any[]>) => {
      state.groups = action.payload;
    },
    setCurrentGroup: (state, action: PayloadAction<any>) => {
      state.currentGroup = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setGroups, setCurrentGroup, setLoading, setError } = groupSlice.actions;
export default groupSlice.reducer;
