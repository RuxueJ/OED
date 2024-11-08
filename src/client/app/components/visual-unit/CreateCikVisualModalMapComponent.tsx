/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import * as d3 from 'd3';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { selectCik } from '../../redux/api/conversionsApi';
import { useAppSelector } from '../../redux/reduxHooks';
import { selectAllUnits } from '../../redux/api/unitsApi';

/**
 * Visual graph component that shows the result of OED's analysis on the
 * relationship between units and conversions entered by an admin. (Uses
 * Cik data for the conversion links).
 * @returns D3 force graph visual
 */
export default function CreateCikVisualMapComponent() {
	const intl = useIntl();

	/* Get unit and Cik data from redux */
	const unitData = useAppSelector(selectAllUnits);
	const cikData = useAppSelector(selectCik);

	/* creating color schema for nodes based on their unit type */
	const colors = ['#1F77B4', '#2CA02C', '#fd7e14', '#e377c2'];
	const colorSchema = d3.scaleOrdinal<string, string>()
		.domain(['meter', 'unit', 'suffix', 'suffix.input'])
		.range(colors);

	/* Create data container to pass to D3 force graph */
	const data: { nodes: any[], links: any[] } = {
		nodes: [],
		links: []
	};

	unitData.map(value =>
		data.nodes.push({
			'name': value.name,
			'id': value.id,
			'typeOfUnit': value.typeOfUnit,
			'suffix' : value.suffix
		})
	);

	cikData.map(function (value) {
		data.links.push({
			'source': value.meterUnitId,
			'target': value.nonMeterUnitId,
			'bidirectional': false
		});
	});

	/* Visuals start here */
	useEffect(() => {
		/* View-box dimensions */
		const width = window.innerWidth;
		const height = 1000;

		/* Grab data */
		const nodes = data.nodes.map(d => ({...d}));
		const links = data.links.map(d => ({...d}));

		const simulation = d3.forceSimulation(nodes)
			.force('link', d3.forceLink(links)
				/* Set all link ids (from data.links) */
				.id((d: any) => d.id)
				/* This controls how long each link is */
				.distance(120)
			)
			/* Create new many-body force */
			.force('charge', d3.forceManyBody()
				/* This controls the 'repelling' force on each node */
				.strength(-800)
			)
			.force('x', d3.forceX())
			.force('y', d3.forceY());

		const svg = d3.select('#sample-cik')
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [-width / 2, -height / 2, width, height])
			.attr('style', 'max-width: 100%; height: auto;')
			.append('g');

		/* End arrow head */
		svg.append('defs').append('marker')
			.attr('id', 'arrow-end')
			.attr('viewBox', '0 -5 10 10')
			.attr('refX', 25)
			.attr('refY', 0)
			.attr('markerWidth', 4)
			.attr('markerHeight', 4)
			/* auto: point towards dest. node */
			.attr('orient', 'auto')
			.append('svg:path')
			.attr('d', 'M0,-5L10,0L0,5');

		/* Link style */
		const link = svg.selectAll('line')
			.data(links)
			.enter().append('line')
			.style('stroke', '#aaa')
			.attr('stroke-width', 3)
			.attr('marker-end', 'url(#arrow-end)');

		/* Node style */
		const node = svg.selectAll('.node')
			.data(nodes)
			.enter().append('circle')
			/* Node radius */
			.attr('r', 20)
			/* checks if unit has a non empty suffix to color differently */
			.attr('fill', d => d.suffix && d.typeOfUnit === 'unit' ? colorSchema('suffix.input') : colorSchema(d.typeOfUnit));

		/* Drag behavior */
		node.call(d3.drag()
			.on('start', dragstart)
			.on('drag', dragged)
			.on('end', dragend));

		/* Node label style */
		const label = svg.selectAll('.label')
			.data(nodes)
			.enter()
			.append('text')
			.text(function (d) { return d.name; })
			.style('text-anchor', 'middle')
			.style('fill', '#000')
			.style('font-family', 'Arial')
			.style('font-size', 14);

		/* Update element positions when moved */
		simulation.on('tick', () => {
			link
				.attr('x1', d => d.source.x)
				.attr('y1', d => d.source.y)
				.attr('x2', d => d.target.x)
				.attr('y2', d => d.target.y);

			node
				.attr('cx', d => d.x)
				.attr('cy', d => d.y);

			label
				.attr('x', function(d){ return d.x; })
				.attr('y', function (d) {return d.y - 25; });
		});

		// eslint-disable-next-line jsdoc/require-jsdoc
		function dragstart(event: any) {
			if (!event.active) simulation.alphaTarget(0.3).restart();
			event.subject.fx = event.subject.x;
			event.subject.fy = event.subject.y;
		}

		// eslint-disable-next-line jsdoc/require-jsdoc
		function dragged(event: any) {
			event.subject.fx = event.x;
			event.subject.fy = event.y;
		}

		// eslint-disable-next-line jsdoc/require-jsdoc
		function dragend(event: any) {
			if (!event.active) simulation.alphaTarget(0);
			event.subject.fx = null;
			event.subject.fy = null;
		}

		/* Color Legend */
		const legend = svg.append('g')
			.attr('transform', `translate(${-width / 2 + 20}, ${-height / 2 + 20})`);

		colorSchema.domain().forEach((item, i) => {
			const legendEntry = legend.append('g')
				.attr('transform', `translate(0, ${i * 25})`);

			// Rectangle color box
			legendEntry.append('rect')
				.attr('width', 20)
				.attr('height', 20)
				.attr('fill', colorSchema(item));

			// Text label
			legendEntry.append('text')
				.attr('x', 30)
				.attr('y', 15)
				.style('fill', '#000')
				.style('font-size', '14px')
				.style('alignment-middle', 'middle')
				/* internationalizing color legend text */
				.text(intl.formatMessage({id : `legend.graph.text.${item}`}));
		});

	// Empty dependency array to run the effect only once
	}, []);

	return (
		<div>
			<div id="sample-cik"></div>
		</div>
	);
}