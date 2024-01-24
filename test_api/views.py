from django.shortcuts import render


# Create your views here.
async def test_sio(request):
    return render(request, "test_sio.html")
