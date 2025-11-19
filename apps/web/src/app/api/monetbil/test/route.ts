import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId') || '25092615422035769387';
    
    const serviceKey = process.env.MONETBIL_SERVICE_KEY;
    
    if (!serviceKey) {
      return NextResponse.json({
        error: 'Clé de service manquante',
        serviceKey: !!serviceKey
      });
    }

    console.log(`🧪 Test direct Monetbil API avec paymentId: ${paymentId}`);
    
    // Selon la doc Monetbil, essayons différents endpoints possibles
    const endpoints = [
      {
        name: 'checkPayment v1',
        url: `https://api.monetbil.com/payment/v1/checkPayment`,
        params: { service: serviceKey, paymentId: paymentId }
      },
      {
        name: 'checkPayment (sans v1)', 
        url: `https://api.monetbil.com/payment/checkPayment`,
        params: { service: serviceKey, paymentId: paymentId }
      },
      {
        name: 'getPaymentStatus',
        url: `https://api.monetbil.com/payment/v1/getPaymentStatus`,
        params: { service: serviceKey, paymentId: paymentId }
      },
      {
        name: 'status check',
        url: `https://api.monetbil.com/payment/v1/status`,
        params: { service: serviceKey, paymentId: paymentId }
      }
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const verifyParams = new URLSearchParams(endpoint.params);
        const fullUrl = `${endpoint.url}?${verifyParams.toString()}`;
        
        console.log(`🔗 Test ${endpoint.name}: ${fullUrl}`);
        
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'MonAppart-Test/1.0'
          }
        });

        console.log(`📊 ${endpoint.name} Status: ${response.status} ${response.statusText}`);
        
        let responseData;
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }
        
        results.push({
          endpoint: endpoint.name,
          url: fullUrl,
          httpStatus: response.status,
          httpStatusText: response.statusText,
          contentType: contentType,
          responseData: responseData,
          isSuccess: response.status === 200 && contentType?.includes('application/json')
        });
        
        // Si on trouve un endpoint qui fonctionne, on s'arrête
        if (response.status === 200 && contentType?.includes('application/json')) {
          console.log(`✅ Endpoint fonctionnel trouvé: ${endpoint.name}`);
          break;
        }
        
      } catch (error) {
        results.push({
          endpoint: endpoint.name,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }
    
    return NextResponse.json({
      status: 'test_complete',
      paymentId: paymentId,
      timestamp: new Date().toISOString(),
      results: results,
      summary: {
        totalEndpoints: endpoints.length,
        successfulEndpoints: results.filter(r => r.isSuccess).length,
        workingEndpoint: results.find(r => r.isSuccess)?.endpoint || 'none'
      }
    });

  } catch (error) {
    console.error('❌ Erreur test Monetbil:', error);
    return NextResponse.json({
      error: 'Erreur test',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
}
