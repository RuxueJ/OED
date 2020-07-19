/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {ActionType} from './actions';
import {CalibratedPoint, CalibrationResult, CartesianPoint, GPSPoint} from '../../utils/calibration';
import * as moment from 'moment';

export enum CalibrationModeTypes {
	initiate = 'initiate',
	calibrate = 'calibrate',
}

export interface ChangeMapModeAction {
	type: ActionType.UpdateMapMode;
	nextMode: CalibrationModeTypes;
}

export interface RequestMapsDetailsAction {
	type: ActionType.RequestMapsDetails;
}

export interface ReceiveMapsDetailsAction {
	type: ActionType.ReceiveMapsDetails;
	data: MapData[];
}

export interface UpdateMapSourceAction {
	type: ActionType.UpdateMapSource;
	data: MapMetadata;
}

export interface UpdateSelectedMapAction {
	type: ActionType.UpdateSelectedMap;
	mapID: number;
}

export interface UpdateCurrentCartesianAction {
	type: ActionType.UpdateCurrentCartesian;
	currentCartesian: CartesianPoint;
}

export interface UpdateCurrentGPSAction {
	type: ActionType.UpdateCurrentGPS;
	currentGPS: GPSPoint;
}

export interface ResetCurrentPointAction {
	type: ActionType.ResetCurrentPoint;
}

export interface AppendCalibrationSetAction {
	type: ActionType.AppendCalibrationSet;
	calibratedPoint: CalibratedPoint;
}

export interface UpdateCalibrationResultAction {
	type: ActionType.UpdateCalibrationResults;
	result: CalibrationResult;
}

export interface DisplayMapLoadingAction {
	type: ActionType.DisplayMapLoading;
}

export interface RequestSelectedMapAction {
	type: ActionType.RequestSelectedMap;
}

export interface ReceiveSelectedMapAction {
	type: ActionType.ReceiveSelectedMap;
	map: MapData;
}

export interface EditMapDetailsAction {
	type: ActionType.EditMapDetails;
	map: MapMetadata;
}

export interface SubmitEditedMapAction {
	type: ActionType.SubmitEditedMap;
	mapID: number;
}

export interface ConfirmEditedMapAction {
	type: ActionType.ConfirmEditedMap;
	mapID: number;
}

export type MapsAction =
	| ChangeMapModeAction
	| UpdateSelectedMapAction
	| RequestMapsDetailsAction
	| ReceiveMapsDetailsAction
	| RequestSelectedMapAction
	| ReceiveSelectedMapAction
	| UpdateMapSourceAction
	| EditMapDetailsAction
	| SubmitEditedMapAction
	| ConfirmEditedMapAction
	| UpdateCurrentCartesianAction
	| UpdateCurrentGPSAction
	| ResetCurrentPointAction
	| AppendCalibrationSetAction
	| UpdateCalibrationResultAction
	| DisplayMapLoadingAction;

/**
 * data format stored in the database
 * @param id
 * @param name
 * @param note
 * @param filename
 * @param modifiedDate
 * @param origin
 * @param opposite
 * @param mapSource
 */
export interface MapData{
	id: number;
	name: string;
	displayable: boolean;
	note?: string;
	filename: string;
	modifiedDate: string;
	origin?: GPSPoint;
	opposite?: GPSPoint;
	mapSource: string;
}

/**
 *  data format used keep track of map's state
 *  @param id {number} id <= -1 means it's a new map;
 */
export interface MapMetadata {
	id: number;
	name: string;
	displayable: boolean;
	note?: string;
	filename: string;
	modifiedDate: string;
	origin?: GPSPoint;
	opposite?: GPSPoint;
	image: HTMLImageElement;
	calibrationMode?: CalibrationModeTypes;
	currentPoint?: CalibratedPoint;
	calibrationSet?: CalibratedPoint[];
	calibrationResult?: CalibrationResult;
}

/**
 * @param mapID <= -1 means it's a new map;
 */
interface MapMetadataByID {
	[mapID: number]: MapMetadata;
}

export interface MapState {
	isLoading: boolean;
	byMapID: MapMetadataByID;
	selectedMap: number;
	editedMaps: MapMetadataByID; // Holds all maps that have been edited locally
	// Maps the app is currently attempting to upload map changes
	submitting: number[];
}

export interface MapEditData {
	name?: string;
	displayable?: boolean;
	note?: string;
	filename?: string;
	modifiedDate: string;
	origin?: GPSPoint;
	opposite?: GPSPoint;
	mapSource?: string;
}
// export interface MapState {
// 	mode: CalibrationModeTypes;
// 	isLoading: boolean;
// 	isDisplayable: boolean;
// 	name: string;
// 	note: string;
// 	lastModified: string;
// 	filename: string;
// 	image: HTMLImageElement;
// 	currentPoint: CalibratedPoint;
// 	calibrationSet: CalibratedPoint[];
// 	calibrationResult: CalibrationResult;
// }
