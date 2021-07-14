<?php

namespace App\Http\Controllers;

use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RecognizeController extends Controller
{
    public function recognize(Request $request)
    {
        $validate = $request->validate([
            'image' => 'mimes:png,jpg|max:2014'
        ]);

        if (!$request->hasFile('image')) {
            return response(['message' => 'Error on load image!'], 400);
        }

        try {
            $path = $request->file('image')->store('images', 's3');

            $validate['filename']   = basename($path);
            $validate['image_path'] = Storage::disk('s3')->url($path);

            $file = new File($validate);

            $file->save();

            return response(['result' => $file], 201);

        } catch (\Exception $e) {
            return response(['message' => 'Error on Recognize image!'], 400);
        }
    }
}
