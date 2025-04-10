from flask import Flask, jsonify
from flask_cors import CORS
from pytrends.request import TrendReq
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

pytrends = TrendReq(hl='en-US', tz=360)

@app.route('/api/trends/daily', methods=['GET'])
def get_daily_trends():
    try:
        trending_searches_df = pytrends.trending_searches(pn='united_states')
        trends = trending_searches_df.values.tolist()
        return jsonify({
            'trends': [{'query': trend[0]} for trend in trends[:20]]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/trends/interest/<keyword>', methods=['GET'])
def get_interest_over_time(keyword):
    try:
        pytrends.build_payload([keyword], timeframe='today 3-m')
        interest_over_time_df = pytrends.interest_over_time()
        
        if interest_over_time_df.empty:
            return jsonify({'values': []})
            
        values = interest_over_time_df[keyword].values.tolist()
        return jsonify({'values': values})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/trends/related/<keyword>', methods=['GET'])
def get_related_queries(keyword):
    try:
        pytrends.build_payload([keyword], timeframe='today 3-m')
        related_queries = pytrends.related_queries()
        
        if not related_queries or keyword not in related_queries:
            return jsonify({'queries': []})
            
        rising = related_queries[keyword]['rising']
        if rising is None:
            return jsonify({'queries': []})
            
        queries = rising['query'].values.tolist()[:5]
        return jsonify({'queries': queries})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/trends/region/<keyword>', methods=['GET'])
def get_interest_by_region(keyword):
    try:
        pytrends.build_payload([keyword], timeframe='today 3-m')
        interest_by_region_df = pytrends.interest_by_region(resolution='COUNTRY')
        
        if interest_by_region_df.empty:
            return jsonify({'regions': {}})
            
        regions = interest_by_region_df[keyword].to_dict()
        return jsonify({'regions': regions})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000) 