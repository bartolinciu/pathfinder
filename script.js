class priorityQueue{
	constructor(){
		this.array = [];
	}

	push( a ){
		this.array.push(a);
		if( this.array.length > 1 )
			this.heapUp();
	}

	heapUp(){
		let i = this.array.length;
		
		while( i >= 2 && this.array[i-1].d < this.array[floor(i/2)-1].d ){//<----
			let buf = this.array[i-1];
			this.array[i-1] = this.array[floor(i/2)-1];
			this.array[floor(i/2)-1] = buf;
			i = floor(i/2);
		}
	}
	heapDown(i = 1){
		while( this.array[2*i-1]  ){
			if( this.array[ 2*i ] ){
				if( this.array[i-1].d > this.array[2*i].d || this.array[i-1].d > this.array[2*i - 1].d ){
					if( this.array[ 2*i ].d > this.array[2*i - 1].d ){
						let buf = this.array[2*i-1];
						this.array[2*i-1] = this.array[ i-1 ];
						this.array[i-1] = buf;
						i = 2*i;
					}
					else{
						let buf = this.array[2*i];
						this.array[2*i] = this.array[ i-1 ];
						this.array[i-1] = buf;
						i = 2*i + 1;
					}
				}
				else{
					break;
				}
			}
			else{
				if( this.array[ 2*i-1 ].d < this.array[i-1].d ){
					let buf = this.array[2*i-1];
					this.array[2*i-1] = this.array[ i-1 ];
					this.array[i-1] = buf;
					i = 2*i;
				}
				else{
					break;
				}
			}
		}
	}

	pop(){
		if( this.array.length > 1 ){
			let value = this.array[0];
			let last = this.array.pop();
			this.array[0] = last;
			if( this.array.length > 1 )
				this.heapDown();
			return value;
		}
		else{
			return this.array.pop();
		}
	}

	build(){
		for( let i = floor(this.array.length/2); i>0; i--){
			this.heapDown( i );
		}
	}
}

let id = 0;

class Vertex{
	constructor( x, y ){
		this.id = id;
		id++;
		this.x = x;
		this.y = y;
		this.paths = [];
		this.d = Infinity;
		this.predecessor = undefined;
		this.visited = false;
	}

	mag(){
		return sqrt( this.x*this.x + this.y*this.y );
	}

	normalize(){
		let l = this.mag();
		this.x/=l;
		this.y/=l;
	}

	dot( v ){
		return this.x*v.x + this.y*v.y;
	}

	add_path(path){
		this.paths.push(path);
	}
}

class Path{
	constructor( start, end ){
		
		this.start = start;
		this.end = end;
		this.v = createVector( end.x-start.x, end.y-start.y );
		this.l = this.v.mag();
		this.v.normalize()
		this.n = createVector( this.v.y, -this.v.x );
		this.c = this.start.dot(this.n);
	}

	draw(){
		line( this.start.x, this.start.y, this.end.x, this.end.y );
	}
}

class Polygon{
	constructor( points ){
		this.points = points;
		let x = 0;
		let y = 0;

		for( let p of points ){
			x+= p.x;
			y+= p.y;
		}

		x/=points.length;
		y/=points.length;

		this.x = x;
		this.y = y;
	}

	draw(){
		strokeWeight(2);
		stroke(255, 0, 0);
		fill( 255, 0, 0, 128 );
		beginShape();
		for( let i = 0; i < this.points.length; i++ ){
			vertex( this.points[i].x, this.points[i].y );
		}
		endShape(CLOSE);

		stroke(255);
		point( this.x, this.y );
	}

	checkForIntersections( path ){
		for( let i = 0; i < this.points.length; i++ ){
			let v = this.points[i];
			let w = this.points[(i+1)%this.points.length];
			let D = (path.start.x - path.end.x)*( v.y-w.y ) - (path.start.y - path.end.y)*( v.x-w.x )
			let t = (( path.start.x - v.x )*( v.y-w.y ) - ( path.start.y - v.y ) * ( v.x-w.x ))/D;
			let u = (( path.start.x - v.x )*( path.start.y-path.end.y ) - ( path.start.y-v.y ) * (path.start.x - path.end.x) )/D;

			if( 0 <= u && u <= 1 && 0 <= t && t <= 1 ){
				return  true;
			}
		}
		return false
	}

	getFurthestVertex( path ){
		let lV;
		let ldmax = 0;
		let rV;
		let rdmax = 0;
		for( let  p of this.points ){
			let d = ( p.dot(path.n) - path.c  )/path.l;

			if( d > rdmax ){
				rV = p;
				rdmax = d;
			}else if( d < ldmax ){
				lV = p;
				ldmax = d;
			}
		}


		//return [new Vertex(lV.x-path.n.x*10, lV.y - path.n.y*10), new Vertex(rV.x+path.n.x*10, rV.y + path.n.y*10)];
		//return[lV, rV];
		return [new Vertex(lV.x-path.n.x, lV.y - path.n.y), new Vertex(rV.x+path.n.x, rV.y + path.n.y)];
	}

}

let polygons;
let start;
let end;
let paths=[];



function setup(){
	createCanvas( 400, 400 );
	polygons = [ new Polygon( [new Vertex( 100, 200 ), new Vertex(200, 100), new Vertex(100,100)] ),
	new Polygon( [ new Vertex( 110, 210 ), new Vertex( 210, 110 ), new Vertex( 210, 210 ) ] ) ];
	start = new Vertex(150, 50);
	print(start);
	end = new Vertex( 100, 300 );
	let path = new Path( start, end );
	paths.push(path);
	//background(0);
}

let T = 0;

function draw(){
	id = 0;
	background(0);

	strokeWeight(2);
	stroke(255);

	let lasttime = millis();

	let path = paths.pop();

	let cleanPaths=[];
	
	let i = 100;

	while( path  ){
		let collision = false;
		for( poly of polygons ){
			if( poly.checkForIntersections( path ) ){
				let a = poly.getFurthestVertex( path );

				paths.push( new Path( path.start, a[0] ) );
				paths.push( new Path( a[0], path.end ) );
				paths.push( new Path( path.start, a[1] ) );
				paths.push( new Path( a[1], path.end ) );
				collision = true;
			}
		}
		if( !collision ){
			cleanPaths.push(path);
			path.start.add_path(path);
		}
		path = paths.pop();
		i--;
	}

	//noLoop();


	stroke( 0, 255, 255 );
	for( path of paths ){
		path.draw();
	}
	

	for( poly of polygons ){
		poly.draw();
	}

	for( cp of cleanPaths ){
		stroke(255);
		strokeWeight(1);
		cp.draw();
	}


	for( path of cleanPaths ){
		path.end.predecessor = undefined;
		path.end.d = Infinity;
	}

	let vertices = new priorityQueue();
	start.d = 0;
	let vex = start;
	

	while( vex ){
		
		for( edge of vex.paths ){
			if(edge.start.d + edge.l < edge.end.d){
				edge.end.d = edge.start.d + edge.l;
				edge.end.predecessor = edge;
			}
			if( !edge.end.visited ){
				vertices.push( edge.end );
				edge.end.visited = true;
			}

		}

		vertices.build();
		vex = vertices.pop();
	}



	stroke( 255, 0, 255 );
	strokeWeight( 2 );
	vex = end;
	while( vex!=start ){
		vex.predecessor.draw();
		vex = vex.predecessor.start;
	}
	

	for( path of cleanPaths ){
		path.end.predecessor = undefined;
		path.end.d = Infinity;
		path.start.paths = [];
	}

	strokeWeight( 6 );
	stroke(255, 255,0 );
	point( start.x, start.y );

	stroke( 0, 255, 0 );
	point( end.x, end.y );


	start.x = 200 + 150 * sin(T);
	path = new Path( start, end );
	paths.push(path);
	T+= 0.01

	//print( millis() - lasttime );

}

function keyPressed(){
	if( keyCode ===DOWN_ARROW ){
		noLoop();
	}
}