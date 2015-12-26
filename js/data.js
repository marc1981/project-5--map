var incidentData = [
	{
		'street': '1010 Magnolia Street, Freeport, TX 77541',
		'lat': 28.944891,
		'long': -95.356262,
		'information': [{'race_ethnicity': 'black',
					'status': 'injury', 
					'age': '30'}],
		'date': '9/2/2015',
		'file_location': 'https://www.texasattorneygeneral.gov/files/cj/peace_officer/FreeportPoliceDepartment-2015-0000002.pdf'
	},
	{
		'street': '4840 E. Plano Parkway, Plano, TX 75074',
		'lat': 33.008157,
		'long': -96.642206,
		'information': [{'race_ethnicity': 'white',
					'status': 'injury', 
					'age': '55'}],
		'date': '9/3/2015',
		'file_location': 'https://www.texasattorneygeneral.gov/files/cj/peace_officer/PlanoPoliceDepartment-2015-0000007.pdf'
	},
	{
		'street': '101 Couch Court, Springtown, TX 76082',
		'lat': 32.916472,
		'long': -97.634237,
		'information': [{'race_ethnicity': 'white',
					'status': 'death', 
					'age': '36'}],
		'date': '9/4/2015',
		'file_location': 'https://www.texasattorneygeneral.gov/files/cj/peace_officer/ParkerCountySheriff-2015-0000013.pdf'
	},
	{
		'street': '4926 Chennault Road, Houston, TX 77033',
		'lat': 29.681614,
		'long': -95.344949,
		'information': [{'race_ethnicity': 'black',
					'status': 'injury', 
					'age': '21'}],
		'date': '9/5/2015',
		'file_location': 'https://www.texasattorneygeneral.gov/files/cj/peace_officer/HoustonPoliceDepartment-2015-0000001.pdf'
	},
	{
		'street': '1500 Range Road, DFW Airport, TX 75261',
		'lat': 32.874895,
		'long': -97.061037,
		'information': [{'race_ethnicity': 'white',
					'status': 'injury', 
					'age': '44'}],
		'date': '9/8/2015',
		'file_location': 'https://www.texasattorneygeneral.gov/files/cj/peace_officer/IrvingPoliceDepartment-2015-0000023.pdf'
	},
	{
		'street': '2435 W. Northwest Hwy, Dallas, TX 75220',
		'lat': 32.860688,
		'long': -96.882686,
		'information': [{'race_ethnicity': 'hispanic',
					'status': 'injury', 
					'age': '29'}],
		'date': '9/9/2015',
		'file_location': 'https://www.texasattorneygeneral.gov/files/cj/peace_officer/DallasPoliceDepartment-2015-0000040.pdf'
	},
	{
		'street': '300 Block Galley Way, Freeport, TX 77541',
		'lat': 29.001476,
		'long': -95.305232,
		'information': [{'race_ethnicity': 'white',
					'status': 'death', 
					'age': '29'}],
		'date': '9/13/2015',
		'file_location': 'https://www.texasattorneygeneral.gov/files/cj/peace_officer/AlvinPoliceDepartment-2015-0000008.pdf'
	},
	{
		'street': '11513 Marriot, Balch Springs, TX 75180',
		'lat': 32.730317,
		'long': -96.629162,
		'information': [{'race_ethnicity': 'white',
					'status': 'injury', 
					'age': 'unknown'}],
		'date': '9/16/2015',
		'file_location': 'https://www.texasattorneygeneral.gov/files/cj/peace_officer/BalchSpringsPoliceDepartment-2015-0000003.pdf'
	},
	{
		'street': '5027 Pecan Grove, San Antonio, TX 78222',
		'lat': 29.3754,
		'long': -98.42063,
		'information': [{'race_ethnicity': 'black',
					'status': 'injury', 
					'age': '22'}],
		'date': '9/18/2015',
		'file_location': 'https://www.texasattorneygeneral.gov/files/cj/peace_officer/BexarCountyConstablePrecinct4-2015-0000010.pdf'
	},
	{
		'street': '9030 Betel Apartment Complex, El Paso, TX 79915',
		'lat': 31.704927,
		'long': -106.310623,
		'information': [{'race_ethnicity': 'hispanic',
					'status': 'injury', 
					'age': '21'}],
		'date': '9/21/2015',
		'file_location': 'https://www.texasattorneygeneral.gov/files/cj/peace_officer/ElPasoPoliceDepartment-2015-0000004.pdf'
	},
	{
		'street': '10800 Stone Canyon Road, Dallas, TX 75230',
		'lat': 32.894743,
		'long': -96.774536,
		'information': [{'race_ethnicity': 'hispanic',
					'status': 'death', 
					'age': '24'}],
		'date': '9/21/2015',
		'file_location': 'https://www.texasattorneygeneral.gov/files/cj/peace_officer/DallasPoliceDepartment-2015-0000005.pdf'
	},
	{
		'street': '800 Deshong Road, Paris, TX 75460',
		'lat': 33.687355,
		'long': -95.547678,
		'information': [{'race_ethnicity': 'white',
					'status': 'death', 
					'age': '21'}],
		'date': '9/21/2015',
		'file_location': 'https://www.texasattorneygeneral.gov/files/cj/peace_officer/TexasDepartmentofPublicSafety-2015-0000036.pdf'
	},
	{
		'street': '1300 Eldarodo Pkwy, McKinney, TX 75069',
		'lat': 33.177661,
		'long': -96.637181,
		'information': [{'race_ethnicity': 'other/unknown',
					'status': 'death', 
					'age': '35'}],
		'date': '9/23/2015',
		'file_location': 'https://www.texasattorneygeneral.gov/files/cj/peace_officer/McKinneyPoliceDepartment-2015-0000038.pdf'
	},
	{
		'street': '942 West Gulfway Drive, Port Arthur, TX 77640',
		'lat': 29.869673,
		'long': -93.955587,
		'information': [{'race_ethnicity': 'black',
					'status': 'injury', 
					'age': '52'}],
		'date': '9/24/2015',
		'file_location': 'https://www.texasattorneygeneral.gov/files/cj/peace_officer/PortArthurPoliceDepartment-2015-0000018.pdf'
	},
	{
		'street': '500 N Cooper Street, Arlington, TX 76012',
		'lat': 32.741067,
		'long': -97.114715,
		'information': [{'race_ethnicity': 'black',
					'status': 'injury', 
					'age': '38'}],
		'date': '9/25/2015',
		'file_location': 'https://www.texasattorneygeneral.gov/files/cj/peace_officer/ArlingtonPoliceDepartment-2015-0000015.pdf'
	},
	{
		'street': '600 Block Robinson Road, Ponder, TX 76259',
		'lat': 33.16663,
		'long': -97.277833,
		'information': [{'race_ethnicity': 'hispanic',
					'status': 'death', 
					'age': '41'}],
		'date': '9/27/2015',
		'file_location': 'https://www.texasattorneygeneral.gov/files/cj/peace_officer/PonderPoliceDepartment-2015-0000066.pdf'
	},
	{
		'street': '972 T.L. Townsend Drive, Rockwall, TX 75087',
		'lat': 32.920682,
		'long': -96.453196,
		'information': [{'race_ethnicity': 'white',
					'status': 'injury', 
					'age': '49'}],
		'date': '9/30/2015',
		'file_location': 'https://www.texasattorneygeneral.gov/files/cj/peace_officer/RockwallCountySheriffsOffice-2015-0000026.pdf'
	}
];