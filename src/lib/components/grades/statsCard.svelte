<script>
	import Chart from "chart.js/auto";
	import { afterUpdate, onMount } from 'svelte';
	import {averages} from '$lib/functions/gradeAverages/averages';
	import {averagesPerSemester} from '$lib/functions/gradeAverages/averagesPerSemester';
	import * as allIonicIcons from 'ionicons/icons';
	import Chip from "$components/shared/Chips.svelte";
	import { t } from "$lib/i18n";


	/**
	 * @type {any}
	 */
	 export let subjects;
	/**
	 * @type {any}
	 */
	 export let passedSubjects;
	 export let searchQuery;
	 /**
	 * @type {any}
	 */
	 export let flip;

	 /**
	 * @type {null | undefined}
	 */
	  export let subjectsJSON;
	 
	 /**
	 * @type {Chart<"line", number[], string>}
	 */

	 let primaryColor;
	 let gradeFill;

	 if (document.body.classList.contains('dark')) {
        primaryColor = getComputedStyle(document.body).getPropertyValue('--app-color-grade-graph').trim();
        gradeFill = getComputedStyle(document.body).getPropertyValue('--app-color-grade-graph-fill').trim();
      } else {
        primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--app-color-grade-graph').trim();
        gradeFill = getComputedStyle(document.documentElement).getPropertyValue('--app-color-grade-graph-fill').trim();
      }



	

	 /**
	 * @type {Chart<"line", never[], never>}
	 */
	 let chart;
	 let gradesObject = {
		"average": 0,
		"weightedAverage": 0,
		"grades": [],
		"ects": 0,
		"averagesPerSemester": [],
		"semester": []
	 };

	

	/**
	 * @param {any} subjectsJSON
	 */
	async function processAverages(subjectsJSON) {
	  try {
	    const result = await averages(subjectsJSON);
	    gradesObject.average = result.avg;
	    gradesObject.weightedAverage = result.weighted_avg;
	    gradesObject.grades = result.grades;
	    gradesObject.ects = result.ects;
	  } catch (error) {
	    console.error(error);
	  }
	  
	}

	/**
	 * @param {null | undefined} subjectsJSON
	 */
	async function processAveragesPerSemester(subjectsJSON) {
	  try {
	    const result = await averagesPerSemester(subjectsJSON);
	    gradesObject.averagesPerSemester = result;

	    for (let i = 1; i <= result.length+1; i++) {
	      gradesObject.semester[i - 1] = i;
	    }
	  } catch (error) {
	    console.error(error);
	  }
	}

	async function gatherData() {		
		await processAverages(subjectsJSON);
		await processAveragesPerSemester(subjectsJSON);
	}





	 onMount(async () => {
       await gatherData();
    });


	afterUpdate( () => {
		if (chart) {
			chart.destroy();
		}
		if (!searchQuery.length) {
		chart = new Chart(document.getElementById('gradeChart'), {
			type: 'line',
			data: {
				labels: gradesObject.semester,
				datasets: [
					{
						data: gradesObject.averagesPerSemester,
						fill: {
							target: 'origin',
							above: gradeFill,
						},
						tension: 0.4,
						borderColor: primaryColor, // Set the color here
            			backgroundColor: "primaryColor" // Optionally set the fill color
						
					},
				],
			},
			options: {
				responsive: true,
				scales: {
					y: {
						beginAtZero: false,
						grid: {
							display: false,
						},
						
					},
				},
				plugins: {
					legend: {
						display: false,
					},
					title: {
						display: true,
						text:$t('progress.average_evolution'),
						font: {
							size: 15
						},
						
						
				
					},
					
				},
			},
		});
	}

	});
	

</script>

<ion-card class="ion-text-center stats">
	<ion-card-header>
		<ion-card-subtitle>
			<h2 class="subtitle">{$t('progress.passed')}</h2>
		</ion-card-subtitle>
	</ion-card-header>
	<ion-card-content>
	{#if !subjects}
			Loading...
	{:else}
		<circle-progress max={subjects} value={passedSubjects} ></circle-progress>
	{/if}
		<ion-list>

			<ion-item>
				<ion-label>{$t('progress.grade_ects')}</ion-label>
				<ion-text>
					<h2>{gradesObject.weightedAverage}</h2>
				</ion-text>
			</ion-item>
			<ion-item>
				<ion-label>{$t('progress.grade_simple')}</ion-label>
				<ion-text>
					<h2>{gradesObject.average}</h2>
				</ion-text>
			</ion-item>

			<ion-item lines="none" class="ion-padding-bottom">
				<ion-label>ECTS</ion-label>
				<ion-text>
					<h2>{gradesObject.ects}</h2>
				</ion-text>
			</ion-item>


			<canvas id="gradeChart" />


			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<Chip chipIcon ={allIonicIcons.calculator} text={$t('progress.average_prediction')} flip = {flip} />


		</ion-list>

	</ion-card-content>
		
	
</ion-card>

<style>

	ion-text {
		color: var(--app-color-primary-dark-variation);
	}


	circle-progress::part(base) {
        width: 120px; 
        height: auto;
        }
    
    circle-progress::part(value) {
        stroke-width: 10;
        stroke: var(--app-color-progress-value);
    }
    circle-progress::part(circle) {
        stroke-width: 10;
        stroke: var(--app-color-progress-circle);
    }
    circle-progress::part(text) {
        font-weight: bold;
        fill: var(--app-color-primary-dark);
    }

	.subtitle {
		color: var(--app-color-primary-dark);
		font-weight: medium;
		margin: 0.5rem;
	}




	


</style>
