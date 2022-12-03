const params = new URLSearchParams(window.location.search);

const app_id = params.get('app_id');
const search_key = params.get('search_key');

const searchClient = algoliasearch(
    app_id,
    search_key // search only API key, not admin API key
  )
  
  const search = instantsearch({
    indexName: 'demo_data',
    searchClient,
    routing: false,
  })
  
  search.addWidgets([
    instantsearch.widgets.configure({
      hitsPerPage: 10,
    }),
  ])
  
  search.addWidgets([
    instantsearch.widgets.searchBox({
      container: '#search-box',
      placeholder: 'Search for memories',
    }),
  ])
  
  search.addWidgets([
    instantsearch.widgets.hits({
      container: '#hits',
        templates: {
            item: `
            <div>
                <img src="{{url}}" height=90 px> <p>{{#helpers.highlight}}{ "attribute": "text" }{{/helpers.highlight}}
            </p></div>
            `,
            empty: `
            <div class="no-results">
                No results have been found for {{query}}.
            </div>
            `,
        },
    }),
  ])
  
  search.start()